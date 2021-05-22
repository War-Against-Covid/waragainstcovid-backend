import { BaseProvider } from '@admin-bro/upload';
import fs, { existsSync } from 'fs';
import { UploadedFile } from 'admin-bro';
import path from 'path';
import RequestError from './RequestError';

export default class CustomImgUpload extends BaseProvider {
    constructor(options: { bucket: string }) {
        super(options.bucket);
        if (!existsSync(options.bucket)) {
            throw new RequestError(404, `Folder ${options.bucket} not found !!`);
        }
    }

    public async upload(file: UploadedFile, key: string): Promise<any> {
        const filePath = process.platform === 'win32'
            ? this.path(key) : this.path(key).slice(1);
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.rename(file.path, filePath);
    }

    public async delete(key: string, bucket: string): Promise<any> {
        if (existsSync(this.path(key, bucket))) {
            await fs.promises.unlink(process.platform === 'win32'
                ? this.path(key, bucket) : this.path(key, bucket).slice(1));
        }
    }

    // eslint-disable-next-line class-methods-use-this
    public path(key: string, bucket?: string): string {
        return process.platform === 'win32' ? `${path.join(bucket || this.bucket, key)}`
            : `/${path.join(bucket || this.bucket, key)}`;
    }
}
