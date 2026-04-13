export function checkModelVersion(modelSetting: any) {
  if (modelSetting.Version || modelSetting.FileReferences) {
    return modelSetting.Version || 3;
  }
  return 2;
}
