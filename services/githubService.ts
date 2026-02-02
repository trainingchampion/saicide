
import { FileNode, GithubRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;
        // GitHub specific retry logic (403 rate limit, 5xx server errors)
        const isRetryable = error.status === 403 || (error.status >= 500 && error.status < 600);
        if (isRetryable) {
            console.warn(`GitHub API call failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

const githubApiRequest = async (endpoint: string, token: string, options: RequestInit = {}) => {
    return retryWithBackoff(async () => {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `GitHub API error: ${response.status} ${response.statusText}` }));
            const error: any = new Error(errorData.message || `GitHub API error: ${response.status}`);
            error.status = response.status;
            throw error;
        }
         // Handle responses that might not have a JSON body (e.g., 204 No Content)
        if (response.status === 204) {
            return null;
        }
        return response.json();
    });
};

const getUserRepos = (token: string): Promise<GithubRepo[]> => {
    return githubApiRequest('/user/repos?sort=updated&per_page=100', token);
};

const createRepo = async (token: string, name: string, description: string, isPrivate: boolean): Promise<GithubRepo> => {
    return githubApiRequest('/user/repos', token, {
        method: 'POST',
        body: JSON.stringify({
            name,
            description,
            private: isPrivate,
            auto_init: true, // Initialize with README to establish main branch
        }),
    });
};

const getBranchSha = async (token: string, repoFullName: string, branch: string): Promise<string> => {
    const refData = await githubApiRequest(`/repos/${repoFullName}/git/ref/heads/${branch}`, token);
    return refData.object.sha;
};

// Helper to recursively flatten file structure for GitHub API
const flattenFileTree = (node: FileNode, path: string): { path: string, content: string }[] => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    if (node.type === 'file') {
        // Only include files with content
        if(typeof node.content === 'string') {
            return [{ path: currentPath, content: node.content }];
        }
        return [];
    }
    if (node.type === 'folder' && node.children) {
        return node.children.flatMap(child => flattenFileTree(child, currentPath));
    }
    return [];
};


const createCommit = async (
    token: string,
    repoFullName: string,
    baseBranch: string,
    newBranchName: string,
    commitMessage: string,
    rootNode: FileNode,
    onProgress: (message: string) => void
) => {
    onProgress('Flattening file structure...');
    const filesToCommit = rootNode.children?.flatMap(child => flattenFileTree(child, '')) || [];
    if (filesToCommit.length === 0) {
        throw new Error("No files with content found to commit.");
    }
    
    onProgress(`Getting info for base branch '${baseBranch}'...`);
    const baseCommitSha = await getBranchSha(token, repoFullName, baseBranch);
    
    const commitDetails = await githubApiRequest(`/repos/${repoFullName}/git/commits/${baseCommitSha}`, token);
    const baseTreeSha = commitDetails.tree.sha;

    onProgress(`Creating ${filesToCommit.length} file blobs...`);
    const blobCreationPromises = filesToCommit.map(file => 
        githubApiRequest(`/repos/${repoFullName}/git/blobs`, token, {
            method: 'POST',
            body: JSON.stringify({ content: file.content, encoding: 'utf-8' }),
        })
    );
    const blobs = await Promise.all(blobCreationPromises);

    onProgress('Creating new git tree...');
    const newTree = filesToCommit.map((file, index) => ({
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobs[index].sha,
    }));
    
    const treeData = await githubApiRequest(`/repos/${repoFullName}/git/trees`, token, {
        method: 'POST',
        body: JSON.stringify({ 
            tree: newTree,
            base_tree: baseTreeSha
        }),
    });

    onProgress('Creating commit...');
    const newCommitData = await githubApiRequest(`/repos/${repoFullName}/git/commits`, token, {
        method: 'POST',
        body: JSON.stringify({
            message: commitMessage,
            tree: treeData.sha,
            parents: [baseCommitSha],
        }),
    });
    
    onProgress(`Creating new branch '${newBranchName}'...`);
    await githubApiRequest(`/repos/${repoFullName}/git/refs`, token, {
        method: 'POST',
        body: JSON.stringify({
            ref: `refs/heads/${newBranchName}`,
            sha: newCommitData.sha,
        }),
    });
    
    onProgress('Done!');
    return `https://github.com/${repoFullName}/tree/${newBranchName}`;
};

export default {
    getUserRepos,
    createCommit,
    createRepo,
};
