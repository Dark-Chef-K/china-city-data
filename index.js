async function getJson(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then(response => response.json())
      .then(data => {
        resolve(data)
      })
  })
}

async function init() {
  const cityData = await getJson('./city.json')
  const levelData = await getJson('./level.json')
  const provinceData = await getJson('./province.json')
  console.log('cityData', cityData)
  console.log('provinceData', provinceData)
  const fullCityData = cityData.map(item => {
    const province = provinceData.find(province => item[0].slice(0, 2) === province[1].slice(0, 2))
    if (province) {
      return [...item, province[1], province[0]]
    } else {
      return [...item, ...item]
    }

  })
  const fullLevelData = levelData.map(item => {
    return {
      ...item,
      children: item.children.map(cityName => {
        const city = fullCityData.find(city => city[1].includes(cityName))
        if (city) {
          return {
            city: city[1],
            cityCode: city[0],
            province: city[3],
            provinceCode: `${city[2]}0000`,
            label: item.name,
          }
        }
        else {
          console.error('not found city', cityName)
          return {}
        }
      }).filter(Boolean)
    }
  })
  console.log('fullLevelData', fullLevelData)

  const allCity = fullLevelData.reduce((arr, item) => {
    return arr.concat(item.children)
  }, [])
  console.log('allCity', allCity)

}
init()