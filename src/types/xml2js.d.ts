// declare module 'xml2js' {
//   export interface ParserOptions {
//     explicitArray?: boolean;
//     mergeAttrs?: boolean;
//     explicitRoot?: boolean;
//     normalizeTags?: boolean;
//     trim?: boolean;
//     attrNameProcessors?: Function[];
//     attrValueProcessors?: Function[];
//     tagNameProcessors?: Function[];
//     valueProcessors?: Function[];
//     [key: string]: any;
//   }

//   export function parseString(
//     xml: string,
//     options: ParserOptions,
//     callback: (err: Error | null, result: any) => void
//   ): void;

//   export function parseString(
//     xml: string,
//     callback: (err: Error | null, result: any) => void
//   ): void;

//   export function parseStringPromise(
//     xml: string,
//     options?: ParserOptions
//   ): Promise<any>;
// }