const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                    console.log(favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err)
                    .catch((err) => next(err))
            );
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                    console.log(favorites);
                    if (favorites == null) {
                        Favorites.create({user: req.user._id})
                            .then((favorites) => {
                                for (var i = (req.body.length - 1); i >= 0; i--) {
                                    favorites.dishes.push(req.body[i]._id);
                                    console.log(favorites);
                                    favorites.save()
                                        .then((favorites) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorites);
                                        }, (err) => next(err));
                                }
                            }, (err) => next(err)
                                .catch((err) => next(err)));
                    } else {
                        console.log(favorites);
                        for (var i = (req.body.length - 1); i >= 0; i--) {
                            if (favorites.dishes.includes(req.body[i]._id) === false)
                                favorites.dishes.push(req.body[i]._id);
                        }
                        favorites.save()
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            }, (err) => next(err));
                    }
                }, (err) => next(err)
                    .catch((err) => next(err))
            );
    })
    // Favorites.create(req.body)
    //     .then((favorites) => {
    //         console.log('favorites created ', favorites);
    //         res.statusCode = 200;
    //         res.setHeader('Content-Type', 'application/json');
    //         res.json(favorites);
    //     }, (err) => next(err)
    //         .catch((err) => next(err)));
    // })
    // favorites.create(req.body)
    //
    // favorites.save()
    //     .then((favorites) => {
    //         res.statusCode = 200;
    //         res.setHeader('Content-Type', 'application/json');
    //         res.json(favorites);
    //     }, (err) => next(err)
    //         .catch((err) => next(err)));
    // } else
    // if (req.body.some((x) => x !== favorites.dishes)) {
    //     favorites.dishes.push(req.body);
    //     favorites.save()
    //         .then((favorites) => {
    //             res.statusCode = 200;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.json(favorites);
    //         }, (err) => next(err)
    //             .catch((err) => next(err)));
    // } else {
    //     err = new Error('Favorites already exists');
    //     err.status = 404;
    //     return next(err);
    // }
    // },
    // (err) => next(err)
    // )
    // .
    // catch((err) => next(err));
    // })
    // .
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findById(req.user._id)
            .then((favorites) => {
                favorites.remove({})
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }, (err) => next(err)
                        .catch((err) => next(err)));
            }, (err) => next(err)
                .catch((err) => next(err)));
    });

module.exports = favoriteRouter;