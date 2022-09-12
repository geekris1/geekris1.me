import dayjs from 'dayjs'

export function formatData(data: string, format = 'YYYY/MM/DD HH:mm:ss') {
  return dayjs.utc(data).format(format)
}