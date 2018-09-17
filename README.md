# Type/Code Development Exercise

For this excercise you are tasked with recreating this article page with one interactive element, an editable title.

The page layout should be recreated in HTML/CSS to replicate the mockup as closely as possible. The mockup can be found in two formats, PDF and Illustrator in the excercise directory.

Assets for the page layout can be found in the excercise/assets directory. Please note that the text of the Article header is transparent to reveal the hero image behind - this is the only element on the page with that effect.

The page layout uses a grid system (guides can be seen in the Illustrator file). At desktop size, this grid is made up of fixed-width gutters on the left and right, with 8 fluid-width columns filling the remaining space in between. (If you're feeling ambitious, you're free to also re-interpret the grid system for smaller viewport sizes).

The one non-standard font used, Copernicus, can be found converted for web use in the excercise/fonts directory. The two other fonts used, Futura and Palatino, are found standard on OS X so it's safe to assume (for the sake of this excercise) that the are present on the user's computer.

The primary interactive element of this excerise is the editable article header. Outside of this, everything on the page can be static - no hover states, no nothing. The article header follows a fairly standard 'edit in place' pattern. In 'edit mode', as a user enters a title for the page, a slug is automatically generated based off of that title. If the slug already exists in the database, an additional 5 random characters should be appended to the generated slug to dodge the collision.

The UI interactions should be powered by Javascript using whatever patterns or frameworks you think are best suited.

The title of the page should be persisted across page reloads in a database. Use whatever database makes the most sense.

It's not necessary to create any functionality that allows the user to create additional pages, or access other pages.

To create some test data, please populate the database with five pages with the following titles. Each page should have a slug that is generated with the same protocol that will be used in the implementation. It should be possible to quickly populate the database with these pages - so consider creating a fixture.

- "It is impossible to walk rapidly and be unhappy."
- "We don't get offered crises, they arrive."
- "I have seen the future and it doesn't work."
- "I dwell in possibility..."
- "Knowledge is power."

The backend software can be created in whatever language and framework you think is best suited.

Specifications for the editable are below as user stories:

- In 'read mode', user sees page title as stored in database.
- In 'read mode', user sees 'edit button'.
- User can click yellow edit button to switch to 'edit mode'.
- In 'edit mode', user sees 'discard button' and 'save button'.
- User can see existing page title in input field upon switching to 'edit mode'.
- User can modify title in 'edit mode'.
- User cannot submit title with 0 characters.
- User sees disabled (grayed out) save button if input contains 0 characters.
- User is presented with a generated slug upon modifying the value of the title input (on keyup).
- If a generated slug conflicts with one already in the database, 5 random characters should be appended to the slug.
- User can click 'save button' to persist title and slug to database and be returned to 'read mode'.
- User can click 'discard button' to discard any modifications.


Please work from this directory, and share your implementation. Ideally, you can create a Git repository and invite us as a collaborator. Instructions should be added to this README file that allow us to take your code, run the application, and evaluate your work. Code should be annotated where sensible.

As a whole, this exercise aims to touch on a variety of skills and concepts involved in a lot of development at Type/Code. Throughout the process, please feel free to reach out for help - while we're reluctant to give hints for implemenation, we're glad to clarify specifications. Please dedicate no more than 12 hours to the exercise - while 100% completion is great, it's not expected - focus on the areas where you know you can excel and identify areas where you might need some help.
