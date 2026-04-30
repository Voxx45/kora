export const PLACE_TYPES: readonly string[] = [
  'accounting', 'bakery', 'bank', 'bar', 'beauty_salon',
  'bicycle_store', 'book_store', 'cafe', 'car_dealer', 'car_repair',
  'car_wash', 'clothing_store', 'convenience_store', 'dentist',
  'department_store', 'doctor', 'drugstore', 'electrician',
  'electronics_store', 'florist', 'furniture_store', 'gas_station',
  'gym', 'hair_care', 'hardware_store', 'home_goods_store',
  'insurance_agency', 'jewelry_store', 'laundry', 'lawyer',
  'locksmith', 'meal_delivery', 'meal_takeaway', 'moving_company',
  'night_club', 'painter', 'pet_store', 'pharmacy',
  'physiotherapist', 'plumber', 'real_estate_agency', 'restaurant',
  'roofing_contractor', 'shoe_store', 'spa', 'store', 'supermarket',
  'travel_agency', 'veterinary_care',
] as const

export function isValidCity(city: unknown): city is string {
  if (typeof city !== 'string') return false
  const trimmed = city.trim()
  return trimmed.length > 0 && trimmed.length <= 100
}

export function isValidPlaceType(type: unknown): type is string {
  if (typeof type !== 'string') return false
  return (PLACE_TYPES as readonly string[]).includes(type)
}
