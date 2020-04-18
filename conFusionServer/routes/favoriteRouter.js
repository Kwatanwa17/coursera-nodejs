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
                                }
                                console.log(favorites);
                                favorites.save()
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorites);
                                    }, (err) => next(err));
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
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                    favorites.remove({})
                        .then((resp) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        }, (err) => next(err)
                            .catch((err) => next(err)));
                }, (err) => next(err)
                    .catch((err) => next(err))
            );
    });

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/' + req.params.dishId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                    console.log(favorites);
                    if (favorites == null) {
                        Favorites.create({user: req.user._id})
                            .then((favorites) => {
                                console.log(favorites);
                                favorites.dishes.push(req.params.dishId)
                                favorites.save()
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorites);
                                    }, (err) => next(err));
                            }, (err) => next(err)
                                .catch((err) => next(err)));
                    } else if (favorites.dishes.includes(req.params.dishId === false)) {
                        favorites.dishes.push(req.params.dishId)
                        favorites.save()
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            }, (err) => next(err));
                    } else {
                        var err = new Error('DishId: ' + req.params.dishId + ' already exists!');
                        err.status = 403;
                        next(err);
                    }
                }, (err) => next(err)
                    .catch((err) => next(err))
            );
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/ ' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                    if (favorites.dishes.includes(req.params.dishId) === true) {
                        favorites.dishes.splice(favorites.dishes.indexOf(req.params.dishId), 1)
                        console.log(favorites);
                        favorites.save()
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            }, (err) => next(err)
                                .catch((err) => next(err)));
                    } else {
                        var err = new Error('DishId: ' + req.params.dishId + ' not exists in favorites!');
                        err.status = 403;
                        next(err);
                    }
                }, (err) => next(err)
                    .catch((err) => next(err))
            );
    });

module.exports = favoriteRouter;