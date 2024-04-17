export interface VocabularyExamplesList {
    items: VocabularyExamples[];
}

export interface VocabularyExamples {
    id: number;
    text: string;
    exampleSentences: string[];
    partsOfSpeech: string;
}

export interface VocabularyExamplesMerged {
    id: number;
    text: string;
    exampleSentences: string[];
    partsOfSpeech: string[];
}
