
import { octokit, isPersonalAccessTokenPresent, octokitUsingPAT } from './octokit'
import { context } from '@actions/github'

import * as input from './shared/getInputs'
const octokitInstance = isPersonalAccessTokenPresent() ? octokitUsingPAT : octokit

export async function getFileContent(): Promise<any> {
    const result = await octokitInstance.repos.getContent({
        owner: input.getRemoteOrgName(),
        repo: input.getRemoteRepoName(),
        path: input.getPathToSignatures(),
        ref: input.getBranch()
    })
    return result
}

export async function createFile(contentBinary): Promise<any> {
    return octokitInstance.repos.createOrUpdateFileContents({
        owner: input.getRemoteOrgName(),
        repo: input.getRemoteRepoName(),
        path: input.getPathToSignatures(),
        message: input.getCreateFileCommitMessage() || 'Creating file for storing CLA Signatures',
        content: contentBinary,
        branch: input.getBranch()
    })
}

export async function updateFile(sha, contentBinary, pullRequestNo): Promise<any> {
    await octokitInstance.repos.createOrUpdateFileContents({
        owner: input.getRemoteOrgName(),
        repo: input.getRemoteRepoName(),
        path: input.getPathToSignatures(),
        sha,
        message: input.getSignedCommitMessage() ?
            input.getSignedCommitMessage().replace('$contributorName', context.actor).replace('$pullRequestNo', pullRequestNo) :
            `@${context.actor} has signed the CLA from Pull Request #${pullRequestNo}`,
        content: contentBinary,
        branch: input.getBranch()
    })
}