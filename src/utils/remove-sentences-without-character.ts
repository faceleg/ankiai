export const removeSentencesWithoutCharacter = (sentences: string[], mustContainCharacter: string): string[] => {
    return sentences.filter((str) => str.includes(mustContainCharacter));
};
