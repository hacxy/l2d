export async function tts(text: string) {
  const response = await fetch('https://tts.hacxy.cn/tts', {
    method: 'POST',
    body: JSON.stringify({
      voice: 'zh-CN-XiaoxiaoNeural',
      text,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.arrayBuffer());
    // 创建 AudioContext 实例
  const audioContext = new AudioContext();
  // 使用 decodeAudioData 解码 ArrayBuffer
  const audioBuffer = await audioContext.decodeAudioData(response);

  return audioBuffer;
}
