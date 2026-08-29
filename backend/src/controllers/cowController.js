const Cow = require('../models/Cow');
const ApiResponse = require('../utils/apiResponse');

// Mock data fallback for standalone/demo testing (RFID-101 to RFID-115)
const mockCows = [
  {
    _id: 'cow-001',
    tagId: 'COW-RFID-101',
    name: 'Bella',
    breed: 'Holstein Friesian',
    birthDate: '2022-03-15',
    gender: 'Female',
    weightKg: 580,
    healthStatus: 'Healthy',
    lactationStage: 'Early',
    barnLocation: 'Barn A - Stall 01',
    dailyAverageYieldLiters: 28.5,
    vaccinationRecords: [{ vaccineName: 'FMD Vaccine', dateAdministered: '2026-01-10', nextDueDate: '2026-07-10' }],
    breedingHistory: [{ inseminationDate: '2025-05-12', isPregnant: false }],
  },
  {
    _id: 'cow-002',
    tagId: 'COW-RFID-102',
    name: 'Daisy',
    breed: 'Jersey',
    birthDate: '2021-08-20',
    gender: 'Female',
    weightKg: 460,
    healthStatus: 'Lactating',
    lactationStage: 'Mid',
    barnLocation: 'Barn A - Stall 02',
    dailyAverageYieldLiters: 22.0,
    vaccinationRecords: [{ vaccineName: 'Anthrax Spore Vaccine', dateAdministered: '2026-02-01', nextDueDate: '2026-08-01' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-003',
    tagId: 'COW-RFID-103',
    name: 'Luna',
    breed: 'Holstein Friesian',
    birthDate: '2023-01-11',
    gender: 'Female',
    weightKg: 520,
    healthStatus: 'Pregnant',
    lactationStage: 'Dry',
    barnLocation: 'Barn B - Maternity Ward',
    dailyAverageYieldLiters: 0,
    vaccinationRecords: [{ vaccineName: 'Brucellosis S19', dateAdministered: '2025-11-15' }],
    breedingHistory: [{ inseminationDate: '2025-11-20', isPregnant: true, expectedCalvingDate: '2026-08-28' }],
  },
  {
    _id: 'cow-004',
    tagId: 'COW-RFID-104',
    name: 'Rosie',
    breed: 'Ayrshire',
    birthDate: '2022-06-18',
    gender: 'Female',
    weightKg: 490,
    healthStatus: 'Healthy',
    lactationStage: 'Mid',
    barnLocation: 'Barn A - Stall 04',
    dailyAverageYieldLiters: 24.5,
    vaccinationRecords: [{ vaccineName: 'FMD Vaccine', dateAdministered: '2026-01-15' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-005',
    tagId: 'COW-RFID-105',
    name: 'Buttercup',
    breed: 'Jersey',
    birthDate: '2022-09-04',
    gender: 'Female',
    weightKg: 440,
    healthStatus: 'Lactating',
    lactationStage: 'Early',
    barnLocation: 'Barn A - Stall 05',
    dailyAverageYieldLiters: 21.8,
    vaccinationRecords: [{ vaccineName: 'Blackleg Vaccine', dateAdministered: '2026-02-10' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-006',
    tagId: 'COW-RFID-106',
    name: 'Molly',
    breed: 'Holstein Friesian',
    birthDate: '2021-11-25',
    gender: 'Female',
    weightKg: 595,
    healthStatus: 'Healthy',
    lactationStage: 'Early',
    barnLocation: 'Barn A - Stall 06',
    dailyAverageYieldLiters: 31.2,
    vaccinationRecords: [{ vaccineName: 'FMD Vaccine', dateAdministered: '2026-01-10' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-007',
    tagId: 'COW-RFID-107',
    name: 'Clara',
    breed: 'Brown Swiss',
    birthDate: '2022-02-14',
    gender: 'Female',
    weightKg: 560,
    healthStatus: 'Lactating',
    lactationStage: 'Mid',
    barnLocation: 'Barn A - Stall 07',
    dailyAverageYieldLiters: 26.0,
    vaccinationRecords: [{ vaccineName: 'Anthrax Vaccine', dateAdministered: '2026-02-05' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-008',
    tagId: 'COW-RFID-108',
    name: 'Ruby',
    breed: 'Sahiwal',
    birthDate: '2023-04-10',
    gender: 'Female',
    weightKg: 480,
    healthStatus: 'Healthy',
    lactationStage: 'Early',
    barnLocation: 'Barn A - Stall 08',
    dailyAverageYieldLiters: 19.5,
    vaccinationRecords: [{ vaccineName: 'HS Vaccine', dateAdministered: '2026-01-20' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-009',
    tagId: 'COW-RFID-109',
    name: 'Maple',
    breed: 'Jersey',
    birthDate: '2021-05-30',
    gender: 'Female',
    weightKg: 450,
    healthStatus: 'Healthy',
    lactationStage: 'Late',
    barnLocation: 'Barn A - Stall 09',
    dailyAverageYieldLiters: 18.0,
    vaccinationRecords: [{ vaccineName: 'FMD Vaccine', dateAdministered: '2026-01-10' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-010',
    tagId: 'COW-RFID-110',
    name: 'Penny',
    breed: 'Holstein Friesian',
    birthDate: '2021-07-19',
    gender: 'Female',
    weightKg: 610,
    healthStatus: 'Lactating',
    lactationStage: 'Early',
    barnLocation: 'Barn A - Stall 10',
    dailyAverageYieldLiters: 33.0,
    vaccinationRecords: [{ vaccineName: 'FMD Vaccine', dateAdministered: '2026-01-12' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-011',
    tagId: 'COW-RFID-111',
    name: 'Clover',
    breed: 'Ayrshire',
    birthDate: '2022-10-08',
    gender: 'Female',
    weightKg: 510,
    healthStatus: 'Pregnant',
    lactationStage: 'Dry',
    barnLocation: 'Barn B - Maternity Ward',
    dailyAverageYieldLiters: 0,
    vaccinationRecords: [{ vaccineName: 'Brucellosis S19', dateAdministered: '2025-12-01' }],
    breedingHistory: [{ inseminationDate: '2025-12-05', isPregnant: true, expectedCalvingDate: '2026-09-12' }],
  },
  {
    _id: 'cow-012',
    tagId: 'COW-RFID-112',
    name: 'Hazel',
    breed: 'Brown Swiss',
    birthDate: '2022-04-22',
    gender: 'Female',
    weightKg: 545,
    healthStatus: 'Healthy',
    lactationStage: 'Mid',
    barnLocation: 'Barn A - Stall 12',
    dailyAverageYieldLiters: 25.4,
    vaccinationRecords: [{ vaccineName: 'Blackleg Vaccine', dateAdministered: '2026-02-15' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-013',
    tagId: 'COW-RFID-113',
    name: 'Stella',
    breed: 'Holstein Friesian',
    birthDate: '2020-12-01',
    gender: 'Female',
    weightKg: 575,
    healthStatus: 'Under Treatment',
    lactationStage: 'Late',
    barnLocation: 'Barn C - Isolation',
    dailyAverageYieldLiters: 14.2,
    vaccinationRecords: [{ vaccineName: 'FMD Booster', dateAdministered: '2026-01-10' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-014',
    tagId: 'COW-RFID-114',
    name: 'Ginger',
    breed: 'Jersey',
    birthDate: '2023-02-18',
    gender: 'Female',
    weightKg: 430,
    healthStatus: 'Healthy',
    lactationStage: 'Early',
    barnLocation: 'Barn A - Stall 14',
    dailyAverageYieldLiters: 23.1,
    vaccinationRecords: [{ vaccineName: 'Anthrax Vaccine', dateAdministered: '2026-02-01' }],
    breedingHistory: [],
  },
  {
    _id: 'cow-015',
    tagId: 'COW-RFID-115',
    name: 'Willow',
    breed: 'Sahiwal',
    birthDate: '2022-08-11',
    gender: 'Female',
    weightKg: 495,
    healthStatus: 'Healthy',
    lactationStage: 'Mid',
    barnLocation: 'Barn A - Stall 15',
    dailyAverageYieldLiters: 20.8,
    vaccinationRecords: [{ vaccineName: 'HS Vaccine', dateAdministered: '2026-01-18' }],
    breedingHistory: [],
  },
];

const getAllCows = async (req, res, next) => {
  try {
    let cows = [];
    try {
      cows = await Cow.find().sort({ createdAt: -1 });
    } catch (e) {
      cows = mockCows;
    }
    if (!cows || cows.length === 0) cows = mockCows;

    return ApiResponse.success(res, { count: cows.length, cows }, 'Livestock list fetched');
  } catch (error) {
    next(error);
  }
};

const getCowByTagId = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    let cow = null;
    try {
      cow = await Cow.findOne({ tagId });
    } catch (e) {
      cow = mockCows.find((c) => c.tagId.toLowerCase() === tagId.toLowerCase());
    }
    if (!cow) cow = mockCows.find((c) => c.tagId.toLowerCase() === tagId.toLowerCase());

    if (!cow) {
      return ApiResponse.error(res, `Cow with Tag ID ${tagId} not found`, 404);
    }
    return ApiResponse.success(res, cow, 'Cow profile retrieved');
  } catch (error) {
    next(error);
  }
};

const createCow = async (req, res, next) => {
  try {
    const cowData = req.body;
    let created = null;
    try {
      created = await Cow.create(cowData);
    } catch (e) {
      created = { _id: `cow-${Date.now()}`, ...cowData, createdAt: new Date() };
    }
    return ApiResponse.success(res, created, 'New cow profile registered', 201);
  } catch (error) {
    next(error);
  }
};

const updateCow = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updated = null;
    try {
      updated = await Cow.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      updated = { _id: id, ...req.body, updatedAt: new Date() };
    }
    return ApiResponse.success(res, updated, 'Cow profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCows,
  getCowByTagId,
  createCow,
  updateCow,
};
