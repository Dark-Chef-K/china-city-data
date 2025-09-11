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
  const levelData = await getJson('./level-origin.json')
  const provinceData = await getJson('./province.json')
  console.log('cityData', cityData)
  console.log('provinceData', provinceData)
  const fullCityData = cityData.map(item => {
    const province = provinceData.find(province => item[0].slice(0, 2) === province[0].slice(0, 2))
    if (province) {
      return [...item, province[0], province[1]]
    } else {
      return [...item, ...item]
    }

  })
  const fullLevelData = levelData.map(item => {
    return {
      ...item,
      children: item.children.map(cityName => {
        const city = fullCityData.find(city => {
          return city[1].includes(`${cityName}市`)
        }) || fullCityData.find(city => {
          return city[1].includes(cityName)
        })
        if (city) {
          return {
            city: city[1].replace('*', ''),
            cityCode: city[0],
            province: city[3].replace('*', ''),
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
  // getCsv(allCity)
}

function getCsv(_data) {
  console.log(_data.map(({ label, city, cityCode, province, provinceCode }) => {
    return [label, city, cityCode, province, provinceCode].map(i => `$${i}$`).join(',')
  }).join('\n').replaceAll('$', '"'))
}
init()

async function getGroup() {
  const cityData = await getJson('./out-city-data.json')
  function groupByLabel() {
    return cityData.reduce((acc, item) => {
      const label = item.label || '无'
      if (!acc.find(group => group.label === label)) {
        acc.push({
          label,
          children: []
        })
      }
      const group = acc.find(group => group.label === label)
      group.children.push(item)
      return acc
    }, [])
  }

  function groupByProvince() {
    return cityData.reduce((acc, item) => {
      const provinceCode = item.provinceCode || '000000'
      if (!acc.find(group => group.provinceCode === provinceCode)) {
        acc.push({
          provinceCode,
          province: item.province || '无',
          children: []
        })
      }
      const group = acc.find(group => group.provinceCode === provinceCode)
      group.children.push(item)
      return acc
    }, []).sort((a, b) => a.provinceCode.localeCompare(b.provinceCode))
  }
  console.log(groupByLabel())
  console.log(groupByProvince())
}

getGroup()