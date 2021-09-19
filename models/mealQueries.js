const pool = require('./dbConfig.js').pool
const {
  v4: uuidv4 
} = require('uuid')

const getMeals = (req, res) => {
    pool.query('SELECT * FROM meals ORDER BY mid ASC', (error, results) => {
      if (error) {
        throw error
      }
      res.status(200).render('../views/meals.ejs', { 
        name: req.user.name,
        meals: results.rows
      })
    })
}

const getMyMeals = (req, res) => {
    const mealHost = req.user.uid
  
    pool.query('SELECT * FROM meals WHERE mealHost = $1', [mealHost], (error, results) => {
      if (error) {
        throw error
      }

      res.render('profile', {
        user : req.user,
        meals: results.rows
      });
    })
}

const getMealById = (req, res) => {
    const mid = req.params.mid
  
    pool.query('SELECT * FROM meals WHERE mid = $1', [mid], (error, results) => {
      if (error) {
        throw error
      }

      if (!results.rows[0]) {
        res.status(400).send('The meal event does not exist.')
        return;
      }
      
      var openStatus = 'No';
      if (results.rows[0]['openstatus'] == true) {
        openStatusBool = 'Yes';
      }

      const startTime = new Date(results.rows[0]['starttime'] * 1);
      const endTime = new Date(results.rows[0]['endtime'] * 1);

      res.status(200).render('../views/mealDetails.ejs', {
        data: results.rows[0],
        name: req.user.name,
        status: openStatus,
        starttime: startTime,
        endtime: endTime
      })
    })
}

const createMeal = (req, res) => {
    const { foodName, foodImage, openStatus, description, startTime, endTime, city, country, allergies } = req.body
    const mid = uuidv4();
    const mealHost = req.user.uid
    const openStatusBool = true

    if (openStatus == 'No') {
      openStatusBool = false
    }

    const startTimeInt = new Date(startTime).getTime();
    const endTimeInt = new Date(endTime).getTime();

    pool.query('INSERT INTO meals (mid, foodName, foodImage, openStatus, mealHost, description, startTime, endTime, city, country, allergies) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', 
    [mid, foodName, foodImage, openStatusBool, mealHost, description, startTimeInt, endTimeInt, city, country, allergies], 
    (error, results) => {
      if (error) {
        throw error
      }
      res.status(302).redirect('/meals/' + mid);
    })
}

const updateMeal = (req, res) => {
    const mid = parseInt(req.params.mid)
    const { foodName, foodImage, openStatus, description, startTime, endTime, city, country, allergies } = req.body
    const uid = req.user.uid

    pool.query('SELECT mealHost FROM meals WHERE mid = $1', [mid], (error, results) => {
      if (results.rows[0] == uid) {
        res.status(400).send('You are not the host of this meal event.')
      }
    })

    if (openStatus == 'Yes') {
      openStatusBool = true;
    } else {
      openStatusBool = false;
    }

    pool.query(
      'UPDATE users SET foodName = $1, foodImage = $2, openStatus = $3, description = $4, startTime = $6, endTime = $7, city = $8, country = $9, allergies = $10 WHERE mid = $11',
      [foodName, foodImage, openStatusBool, description, mealDate, startTime, endTime, city, country, allergies],
      (error, results) => {
        if (error) {
          throw error
        }
        res.status(302).redirect('/meals/' + mid);
      }
    )
}

const deleteMeal = (req, res) => {
    const mid = parseInt(req.params.mid)
    const uid = req.user.uid
  
    pool.query('SELECT mealHost FROM meals WHERE mid = $1', [mid], (error, results) => {
      if (results.rows[0] == uid) {
        res.status(400).send('You are not the owner of this meal post.')
      }
    })

    pool.query('DELETE FROM users WHERE mid = $1', [mid], (error, results) => {
      if (error) {
        throw error
      }
      res.status(302).redirect('/meals/' + mid);
    })
}
 
module.exports = {
    getMeals,
    getMyMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal
}