# Walmart InHome: Full Stack Take Home Challenge

Thanks for your interest in Walmart InHome!

As part of our interview process we'd like you to build a simple web application that allows a user to view and update information pulled from a SQL database. This web application should interface with this database through a simple back end. You can assume that this is a tool to be used by a customer support representative, so they should be able to view and manage orders for all users without worrying about auth or access rights.

This challenge should take approximately 4-6 hours to complete.

Use whatever packages and frameworks you are most comfortable with. You can use any open source libraries you want, but please include documentation on why you chose each library. To help you get started, we've included a SQLite database (see documentation below).

## Requirements

* A React UI allowing the user to view, create and update orders.
	* Bonus for using APIs that are a part of React 16+
	* Use of `Create React App` is acceptable.
* A backend enabling communication between the front-end and the provided database.
* A clean usable interface, styled with CSS, Styled-Components, Sass or similar. Someone viewing the app for the first time should be able to find any of the required information. What exactly this looks like is up to you.
* Documentation on your project. Please include reasoning behind your development decisions, documentation on building and installing the project and any other documentation you may choose to add.

## Submitting

When you're done with the project please send us a link to a repository or provide a zip file.

## Extra Credit

If you find yourself with spare time after taking care of the requirements consider:

* Integrating your backend with a 3rd party API that can:
	* Geocode the user's street address (updating the models as needed)
	* Generate a random avatar for the user
* Spending some extra time on the visual presentation. Add some animations, perfect the spacing, go wild!

The challenge is open-ended, so if you have any other ideas, feel free to try them! Just be sure to document whatever changes and/or additions you make. 

## Help

Don't be afraid to reach out if you need clarification or get stuck.

## Resources

### Database

The Database comes pre-populated with a handful of users and items, and is built according to the below schema:

```
PRAGMA foreign_keys = ON; 

 

CREATE TABLE users ( 

  id INTEGER PRIMARY KEY AUTOINCREMENT, 

  name VARCHAR(255) NOT NULL 

); 

 

CREATE TABLE orders ( 

  id INTEGER PRIMARY KEY AUTOINCREMENT, 

  user_id INTEGER NOT NULL, 

  FOREIGN KEY(user_id) REFERENCES users(id) 

); 

 

CREATE TABLE items ( 

  id INTEGER PRIMARY KEY AUTOINCREMENT, 

  name VARCHAR(255) NOT NULL 

); 

 

CREATE TABLE order_items ( 

  order_id INTEGER NOT NULL, 

  item_id INTEGER NOT NULL, 

  FOREIGN KEY (order_id) REFERENCES orders(id), 

  FOREIGN KEY (item_id) REFERENCES items(id), 

  PRIMARY KEY (order_id, item_id) 

); 

```
