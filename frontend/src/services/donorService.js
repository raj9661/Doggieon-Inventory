import api from "./api"

/**
 * Get all donors with pagination and search
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Donors and pagination data
 */
export const getDonors = async (params = {}) => {
  const response = await api.get("/donors", { params })
  return response.data
}

/**
 * Get donor by ID
 * @param {string} id - Donor ID
 * @returns {Promise<Object>} - Donor data
 */
export const getDonorById = async (id) => {
  const response = await api.get(`/donors/${id}`)
  return response.data
}

/**
 * Create new donor
 * @param {Object} data - Donor data
 * @returns {Promise<Object>} - Created donor
 */
export const createDonor = async (data) => {
  const response = await api.post("/donors", data)
  return response.data
}

/**
 * Update donor
 * @param {string} id - Donor ID
 * @param {Object} data - Donor data
 * @returns {Promise<Object>} - Updated donor
 */
export const updateDonor = async (id, data) => {
  const response = await api.put(`/donors/${id}`, data)
  return response.data
}

/**
 * Delete donor
 * @param {string} id - Donor ID
 * @returns {Promise<Object>} - Deleted donor
 */
export const deleteDonor = async (id) => {
  const response = await api.delete(`/donors/${id}`)
  return response.data
}

/**
 * Get top donors
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - Top donors
 */
export const getTopDonors = async (params = {}) => {
  const response = await api.get("/donors/top", { params })
  return response.data
}
