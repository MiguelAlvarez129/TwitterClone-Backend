const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

module.exports = (tweetDate) => {
  const date1 = dayjs(tweetDate)
  const dif = dayjs().diff(date1,'hour')
  const difMinutes = dayjs().diff(date1,'minute')
  const longdate = date1.format('MMM D, YYYY')
  const shortdate = date1.format('MMM D')

  switch(true){
    case difMinutes === 0:
      return "a few moments ago"
    case difMinutes <= 60:
      return  difMinutes + "m" 
    case dif <= 24:
      return dif + "h" 
    case date1.year() == dayjs().year():
      return shortdate
    default:
      return longdate
  }
 }