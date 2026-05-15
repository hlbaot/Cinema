import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export type MailAttachmentDto = {
    filename: string;
    path: string;
    cid?: string;
};

export class SendMailDto{
    @IsString()
    to: string;

    @IsString()
    subject: string;

    @IsString()
    html?: string;

    @IsString()
    text?: string

    attachments?: MailAttachmentDto[];
}
