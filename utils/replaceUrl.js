module.exports = (url) =>{
  console.log(url,url.replace(/\\/g,'/'),'HERE!')
  return url.replace(/\\/g,'/')
}