export type RequestId = string;
export type QuestionId = number;
export type FieldType = 'text' | 'number' | 'radio' | 'toggle';

export interface SchemaField {
  id: number;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  default?: any;
}

export interface SchemaSection {
  id: string;
  title: string;
  fields: SchemaField[];
}

export interface RequestSchema {
  id: string;
  title: string;
  sections: SchemaSection[];
}


export interface SaveResult {
  ok: true;
  requestId: RequestId;
  questionId: QuestionId;
  value: any;
}
