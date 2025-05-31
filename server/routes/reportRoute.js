const express = require('express');
const router = express.Router();
const { createReport,getReport,updateReport} = require('../controllers/reportController');


router.post('/create',createReport)

router.get('/get',getReport)

router.put('/update',updateReport)

module.exports = router