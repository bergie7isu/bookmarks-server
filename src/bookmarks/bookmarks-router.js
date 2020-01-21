const path = require('path');
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { bookmarks } = require('../store');
const xss = require('xss');
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(bookmark => ({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url),
                    description: xss(bookmark.description),
                    rating: bookmark.rating
                })))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { title, url, description, rating } = req.body;
        const newBookmark = { title, url, description, rating };
        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                logger.error(`${key} is required!`);
                return res.status(400).send('Invalid data!')
            }
        }
        if (rating < 0 || rating > 5) {
            logger.error(`Rating must be between 0 and 5!`);
            return res.status(400).send('Rating must be between 0 and 5!')
        }
        BookmarksService.insertBookmark(knexInstance, newBookmark)
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created.`)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
                    .json({
                        id: bookmark.id,
                        title: xss(bookmark.title),
                        url: xss(bookmark.url),
                        description: xss(bookmark.description),
                        rating: bookmark.rating
                    })
            })
            .catch(next)
    });

bookmarksRouter
    .route('/bookmarks/:id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.id
        )
        .then(bookmark => {
            if (!bookmark) {
                return res.status(404).json({
                    error: { message: `Bookmark not found!` }
                })
            }
            res.bookmark = bookmark
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.bookmark.id,
            title: xss(res.bookmark.title),
            url: xss(res.bookmark.url),
            description: xss(res.bookmark.description),
            rating: res.bookmark.rating
        })
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(req.app.get('db'), req.params.id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body;
        const bookmarkToUpdate = { title, url, description, rating };
        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain either 'title', 'url', 'description', or 'rating'` }
            })
        }
        BookmarksService.updateBookmark(req.app.get('db'), req.params.id, bookmarkToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter;