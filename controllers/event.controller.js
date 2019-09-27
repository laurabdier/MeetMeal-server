const Event = require('../models/event.model.js');
const User = require('../models/user.model.js');
const { check } = require('express-validator');


/**
 * This function creates an event
 * 
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(event)
 */

exports.create = async function(req, res) {
    try {

    const { title, date, hour, minutes, typeOfCuisine, typeOfMeal, description, menu, allergens, zipCode, address, city, numberMaxOfGuests, cost } = req.body;
    const user = req.user.id;

    if( !title || !date || !hour || !minutes || !typeOfCuisine || !typeOfMeal || !zipCode || !address || !city || !numberMaxOfGuests || !cost) {
        return res.status(400).json({
            msg: "Veuillez renseigner au moins tous les champs suivant : Titre, Date, Heure, Type de Cuisine, Type de Repas, Code Postal, addresse"
        })
    }

    let event = new Event ({
        user,
        title,
        date,
        time: {
            hour,
            minutes
        },
        typeOfCuisine,
        typeOfMeal,
        description,
        menu,
        allergens,
        zipCode,
        address,
        city,
        numberMaxOfGuests,
        cost
    });

    await event.save()

    res.status(200).json({
        msg: 'Evenement cree'
    });  
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }

}

/**
 * This function lists all events
 * 
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(events)
 */

exports.listEvents = async function(req, res) {
    try {
        const events = await Event.find()
        .populate({
            path: 'user',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'guests.userId',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'comments.user',
            model: User,
            select: 'firstname avatar'
        })

        if(!events) {
            res.status(400).json({
                msg: 'Aucun evenement trouve'
            })
        }
        
        res.json(events);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function add a guest to an event
 *
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(guests)
 */

exports.addGuest = async function (req, res) {
    try {
        const user = req.user.id;
        const event = await Event.findById(req.params.id);        
        const guests = event.guests;

        if (guests.length < event.numberMaxOfGuests) {
            if (guests.filter(guest => guest.userId === user).length == 0) {
                if (user != event.user) {
                    guests.push({ userId: user });        
                    await event.save();
                    res.json(guests);
                } else {
                    return res.status(400).json({ msg: 'Vous ne pouvez pas rejoindre votre propre evenement' });
                }
            } else {
                return res.status(400).json({ msg: 'Vous etes deja inscrit a cet evenement' });
            }
        } else {
            return res.status(400).json({ msg: "Nombre maximum d'invites deja atteint" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    };
}

/**
 * This function remove a guest from an event
 *
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(guests)
 */

exports.removeGuest = async function (req, res) {
    try {
        const user = await User.findById(req.user.id).select('admin');
        const event = await Event.findById(req.params.id);
        const guests = event.guests;
        const removeIndex = guests.map(guest => guest.userId).indexOf(user);

        if(!user) {
            if(guests.filter(guest => guest.userId === req.user.id).length == 0) {
                return res.status(404).json({
                    msg: 'Aucun utilisateur trouve'
                })
            }
        }

        guests.splice(removeIndex, 1);
        await event.save();
        res.json(event);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function change the status of a guest to "Accepté"
 *
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(acceptedGuest[0].status)
 */

exports.acceptGuest = async function (req, res) {
    try {
        const user = await User.findById(req.user.id).select('admin');
        const event = await Event.findById(req.params.event_id);
        guests = event.guests;
        acceptedGuest = guests.filter(guest => guest.userId == req.params.acceptedGuest_id);

        if(!user) {
            if(event.user.toString() !== req.user.id) {
                return res.status(401).json({
                    msg: 'Acces refuse'
                })
            }
        }

        acceptedGuest[0].status = 'Accepte';
        event.save();
        res.json({
            msg: 'Utilisateur accepte'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function change the status of a guest to "Refusé"
 *
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(acceptedGuest[0].status)
 */

exports.refuseGuest = async function (req, res) {
    try {
        const user = await User.findById(req.user.id).select('admin');
        const event = await Event.findById(req.params.event_id);
        guests = event.guests;
        refusedGuest = guests.filter(guest => guest.userId == req.params.refusedGuest_id);

        if(!user) {
            if(event.user.toString() !== req.user.id) {
                return res.status(401).json({
                    msg: 'Acces refuse'
                })
            }
        }

        refusedGuest[0].status = 'Refuse';
        event.save();
        res.json({
            msg: 'Utilisateur refuse'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function shows an event
 * 
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(event)
 */

exports.showEvent = async function(req, res) {
    try {
        const event = await Event.findById(req.params.id)
        .populate({
            path: 'user',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'guests.userId',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'comments.user',
            model: User,
            select: 'firstname avatar'
        });

        if(!event) {
            return res.status(404).json({
                msg: 'Evenement non trouve'
            })
        }

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function updates an event
 * 
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json(event)
 */

 exports.updateEvent = async function(req, res) {
     try {
        let event = await Event.findById(req.params.id);
        const user = await User.findById(req.user.id).select('admin');
        const { title, date, hour, minutes, typeOfCuisine, typeOfMeal, description, menu, allergens, zipCode, address, city, numberMaxOfGuests, cost } = req.body;

        if(!event) {
            return res.status(404).json({
                msg: 'Evenement non trouve'
            })
        }

        // Check on user
        if(!user) {
            if(event.user.toString() !== req.user.id) {
                return res.status(401).json({
                    msg: 'Acces refuse'
                })
            }
        }

        if(title && event.title != title) event.title = title;
        if(date && event.date != date) event.date = date;
        if(hour && event.hour != hour) event.hour = hour;
        if(minutes && event.minutes != minutes) event.minutes = minutes;
        if(typeOfCuisine && event.typeOfCuisine != typeOfCuisine) event.typeOfCuisine = typeOfCuisine;
        if(typeOfMeal && event.typeOfMeal != typeOfMeal) event.typeOfMeal = typeOfMeal;
        if(description && event.description != description) event.description = description;
        if(menu && event.menu != menu) event.menu = menu;
        if(allergens && event.allergens != allergens) event.allergens = allergens;
        if(zipCode && event.zipCode != zipCode) event.zipCode = zipCode;
        if(address && event.address != address) event.address = address;
        if(city && event.city != city) event.city = city;
        if(numberMaxOfGuests && event.numberMaxOfGuests != numberMaxOfGuests) event.numberMaxOfGuests = numberMaxOfGuests;
        if(cost && event.cost != cost) event.cost = cost;

        await event.save();

        res.json(event);  
     } catch (err) {
         console.error(err.message);
         res.status(500).send('Erreur Serveur');
     }
 }

/**
 * This function validates an event status
 * 
 * @param {*} req
 * @param {*} res
 * @access Admin
 * @returns res.json(event)
 */

exports.validEvent = async function(req, res) {
    try {
        const event = await Event.findById(req.params.id);

        if(!event) {
            return res.status(404).json({
                msg: 'Evenement non trouve'
            })
        }

        event.status = 'Accepte';
        await event.save();

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function refuses an event status
 * 
 * @param {*} req
 * @param {*} res
 * @access Admin
 * @returns res.json(event)
 */

exports.refuseEvent = async function(req, res) {
    try {
        const event = await Event.findById(req.params.id);

        if(!event) {
            return res.status(404).json({
                msg: 'Evenement non trouve'
            })
        }

        event.status = 'Refuse';
        await event.save();

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function create a comment
 *
 * @param {*} req
 * @param {*} res
 * @returns res.json(event.comments)
 */

exports.comment = async function (req, res) {
    try {
        const event = await Event.findById(req.params.id);
        const comment = {
            content: req.body.content,
            user: req.user.id,
        };

        event.comments.push(comment);
        await event.save();
        res.json(event.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function update a comment
 *
 * @param {*} req
 * @param {*} res
 * @returns res.json(event.comments)
 */

exports.updateComment = async function (req, res) {
    try {
        const user = req.user.id;
        const event = await Event.findById(req.params.event_id);
        const comment = event.comments.find(comment => comment.id === req.params.comment_id);
        const { content } = req.body;

        if (!comment)
            return res.status(404).send("Ce commentaire n'existe pas");

        if (comment.user.toString() === user || user.admin) {
            if(content) comment.content = content;
            await event.save();
            res.json(event.comments);
        } else {
            return res.status(401).send("Vous n'avez pas les droits pour cet action");
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function delete a comment
 *
 * @param {*} req
 * @param {*} res
 * @returns res.json(event.comments)
 */

exports.deleteComment = async function (req, res) {
    try {
        const event = await Event.findById(req.params.event_id);
        const comment = event.comments.find(comment => comment.id === req.params.comment_id);
        const user = req.user.id;

        if (!comment)
            return res.status(404).send("Ce commentaire n'existe pas");

        if (comment.user.toString() !== user)
            return res.status(401).send("Vous n'avez pas les droits pour cet action");

        const removeIndex = event.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        event.comments.splice(removeIndex, 1);
        await event.save();
        res.json(event.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
}

/**
 * This function delete and event by id
 * 
 * @param {*} req
 * @param {*} res
 * @access Private
 * @returns res.json({msg})
 */

exports.deleteEvent = async function(res, res) {
    try {
        const event = await Event.findById(req.params.id);
        const user = await User.findById(req.user.id).select('admin');
    
        if(!event) {
            return res.status(404).json({
                msg: 'Evenement non trouve'
            })
        }
        
        if(!user) {
            if(event.user.toString() !== req.user.id) {
                return res.status(401).json({
                    msg: 'Acces refuse'
                })
            }
        }

        await event.remove();
        res.json({
            msg: 'Evenement supprime'
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur')
    }
};

/**
 * This function shows every events created by an user
 * 
 * @param {*} req
 * @param {*} res
 * @access Public
 * @returns res.json(events)
 */

exports.showCreatedEvents = async function (req, res) {
    try {
        const user = await User.findById(req.params.id).select('-password');
        const events = await Event.find({ user: user.id })
        .populate({
            path: 'user',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'guests.userId',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'comments.user',
            model: User,
            select: 'firstname avatar'
        });

        if (!user) {
            return res.status(404).json({
                msg: "Utilisateur non trouve"
            });
        };

        if (!events) {
            return res.status(404).json({
                msg: "Evenements non trouves"
            });
        };

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur')  
    }
}

/**
 * This function shows every events where the user is a guest
 * 
 * @param {*} req
 * @param {*} res
 * @access Public
 * @returns res.json(events)
 */

exports.showGuestsEvents = async function (req, res) {
    try {
        const user = await User.findById(req.params.id).select('-password');
        const events = await Event.find({'guests.userId': user.id})
        .populate({
            path: 'user',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'guests.userId',
            model: User,
            select: 'firstname avatar'
        })
        .populate({
            path: 'comments.user',
            model: User,
            select: 'firstname avatar'
        });

        if (!user) {
            return res.status(404).json({
                msg: "Utilisateur non trouve"
            });
        };

        if (!events) {
            return res.status(404).json({
                msg: "Evenements non trouves"
            });
        };

        res.json(events);        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur')
    }
};