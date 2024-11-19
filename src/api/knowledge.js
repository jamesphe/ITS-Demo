export function getCategories(params) {
  return request({
    url: '/knowledge/categories',
    method: 'get',
    params
  })
}

export function addCategory(data) {
  return request({
    url: '/knowledge/categories',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: `/knowledge/categories/${data.id}`,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/knowledge/categories/${id}`,
    method: 'delete'
  })
} 