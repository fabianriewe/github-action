import {CommittersDetails} from './interfaces'
import * as core from '@actions/core'
import Arweave from 'arweave';

const arweave = Arweave.init(
    {
        host: 'arweave.net',// Hostname or IP address for a Arweave host
        port: 443,          // Port
        protocol: 'https',  // Network protocol http or https
        timeout: 20000,     // Network request timeouts in milliseconds
        logging: false,     // Enable network request logging
    }
);


export default async function storeOnArweave(newSignedCommitters: CommittersDetails[]) {
    const key: any = core.getInput('arweave-keyfile') //TODO change this top shared

    let tx_ids: string[] = [];

    for (const newSignedCommitter of newSignedCommitters) {
        let transaction = await arweave.createTransaction({
            data: newSignedCommitter.body,
        }, key);

        transaction.addTag('App-Name', 'CLA-Assistant');
        transaction.addTag('Name', newSignedCommitter.name);
        transaction.addTag('ID', newSignedCommitter.id.toString());
        transaction.addTag('PullRequestNo', newSignedCommitter.pullRequestNo as any);
        transaction.addTag('CreatedAt', newSignedCommitter.created_at as any);
        transaction.addTag('UpdatedAt', newSignedCommitter.updated_at as any);
        transaction.addTag('RepoId', newSignedCommitter.repoId as any);

        await arweave.transactions.sign(transaction, key);
        const response = await arweave.transactions.post(transaction);

        tx_ids.push(transaction.id)
    }

    return tx_ids
}