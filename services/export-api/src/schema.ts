import { ResumeSchema } from '@resume-tailorer/shared';

export type TemplateId = 'modern' | 'classic';

export interface ExportRequest {
    tailoredResume: ResumeSchema;
    template: TemplateId;
}
