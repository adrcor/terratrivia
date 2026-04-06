export function cpm(typingTime: number, answerLength: number): number {
  return Math.floor((60000 / typingTime) * answerLength);
}

export function wpm(typingTime: number, answerLength: number): number {
  return Math.floor(cpm(typingTime, answerLength) / 5);
}
