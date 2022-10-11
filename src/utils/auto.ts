import fg from 'fast-glob'

export async function getComponent(): Promise<Record<string, string>> {
  let data = await fg('src/component/**/*.tsx');
  let path: Record<string, string> = {};
  data.forEach(item => {
    let componentName = item.match(/\/([a-zA-Z0-9]+).tsx/)?.[1];
    if (componentName) {
      path[componentName] = item.replace(".tsx", '')
    }

  })
  return path
}



