const express = require('express');
const router = express.Router();
const db = require('../helpers/init-mysql');
const { QueryTypes } = require('Sequelize');
const logger = require('../helpers/winston');
const {
    religionValidationRules,
    validate,
} = require('../helpers/validators/masterValidators');
const {
    ensureAuthenticated,
    ensureNotAuthenticated,
} = require('../helpers/auth-helper');
const religionController = require('../controllers/religionController');
const rateLimitter = require('../helpers/rate-limiter');
const { stringify } = require('uuid');

// limit access to routes in this filename
router.use(rateLimitter);

// Main Page
// router.get('/', ensureAuthenticated, async (req, res, next) => {
//     await religionController.getReligion(req, res, next);
// });

router.get('/', ensureAuthenticated, async (req, res, next) => {
    const resultPerPage = 10;
    try {
        let sql = 'SELECT * FROM religions';
        db.query(sql, (err, result) => {
            if (err) throw err;
            const numOfResults = result.length;
            const numOfPages = Math.ceil(numOfResults / resultPerPage);
            let page = req.query.page ? Number(req.query.page) : 1;
            if (page > numOfPages) {
                res.redirect(
                    '/religion/?page' + encodeURIComponent(numOfPages)
                );
            } else if (page < 1) {
                res.redirect('/religion/?page' + encodeURIComponent('1'));
            }
            const startingLimit = (page - 1) * resultPerPage;
            console.log('page: ' + page);
            let sql = `SELECT * FROM religions LIMTI ${startingLimit}, ${resultPerPage} `;
            db.query(sql, (err, results) => {
                if (err) throw err;
                let interator = page - 5 < 1 ? 1 : page - 5;
                let endingLink =
                    interator + 9 <= numOfPages
                        ? interator + 9
                        : page + (numOfPages - page);
                if (endingLink < page + 4) {
                    interator -= page + 4 - numOfPages;
                }
            });
            res.render('masterPages/religion', {
                userData: result,
                page,
                interator,
                endingLink,
                numOfPages,
            });
        });
    } catch (error) {
        res.send('data is not shown: ' + error.message);
        console.log('  klwldfff = > ', error.message);
    }
});

router.post(
    '/',
    ensureAuthenticated,
    religionValidationRules(),
    validate,
    (req, res, next) => {
        religionController.postReligion(req, res, next);
    }
);
// delete

router.get('/:id', async function (request, response, next) {
    var id = request.params.id;

    try {
        const rows = await db.query(
            `DELETE FROM religions WHERE id = "${id}"`,
            {
                // type: QueryTypes.DELETE,
            }
        );
        console.log('rows', rows);
        request.flash('success_msg', 'Data Deleted successfully.');
        return response.redirect('/religion');
    } catch (error) {
        if (error) {
            logger.error("Can't delete religions from database", error);
            return null;
        }
    }
});

module.exports = router;
