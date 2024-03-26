const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const formatFileName = (fileName: string): string => {
  const noAccents = removeAccents(fileName)
  return noAccents.replace(/\s+/g, '-').toLowerCase()
}
