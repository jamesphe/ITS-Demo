import Mock from '@/mock/sla'

export function fetchSLAList(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Mock.getSLAList(query))
    }, 300)
  })
}

export function fetchSLA(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Mock.getSLA(id))
    }, 300)
  })
}

export function createSLA(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 20000,
        data: 'success'
      })
    }, 300)
  })
}

export function updateSLA(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 20000,
        data: 'success'
      })
    }, 300)
  })
}

export function fetchSLAServices(id) {
  return new Promise((resolve) => {
    const sla = Mock.getSLA(id)
    setTimeout(() => {
      resolve({
        code: 20000,
        data: sla.data.services || []
      })
    }, 300)
  })
} 