# You will collaborate in groups of 3 where you will make a simple webshop where you can put products in a shopping cart and then "go to the checkout" and place an order.

## Basic requirements

Below sanitary requirements must be met regardless of the grade level.

- Be responsive (mobile first, at least 3 different breakpoints)
- Semantically correct
- Use flexboxes or CSS grid (can of course use Bootstrap / Tailwind etc.)
- All data and status should be in Typescript, and. should not use the DOM as a "single point of truth"
- Published via Netlify/GitHub Pages/Vercel

## Version control

All development should be versioned in a Git repository. One of you creates a private repo and invites the others as collaborators, as well as me). You will work in branches that will be pushed to GitHub. PR is optional. Running commits with descriptive commit messages.

## Main requirements

Make a simple webshop that uses the API that I set up, where you will pick up products that you can put in a shopping cart and then place an order (via a POST to an API endpoint I also set up).
When the visitor arrives at the page, all products should be shown with a picture (thumbnail), name, price and an "Add to cart" button.
The visitor should be able to add several copies of a product to the shopping cart, however, it is possible for “project approval level” that each copy of a product is displayed as a separate line in the shopping cart.
You should also be able to click on a product (preferably through a "Read more" link) and there see more information about the product (big picture, name, price, description / can be displayed as a lightbox), without losing the shopping cart.
The shopping cart must be displayed with a summary on the page that can be unfolded, where you should also be able to remove a product from the shopping cart.
In the shopping cart, there should be a "Go to checkout" button that shows a new view where you can fill in your name, address, postal number, city, phone (should not be required) and e-mail.
When placing the order, any errors should be displayed, and if the order is successful, the order number for the order should be displayed as well as a thank you message.
Communication with the API should be separate in an external file.

## Requirements for passing with distinction

The app is written in TypeScript and you should be able to click add several times on a product but only 1 is displayed in the shopping cart along with the number.
On each product in the shopping cart, there should be +/- buttons to increase / decrease the number. Of course, the product should be removed from the shopping cart when the number becomes 0, and you should still be able to remove the entire product from the shopping cart at once without having to change the number to 0.
The shopping cart and customer information (if there are previous orders) should also be saved in a Local Storage so it survives the reloading of the page.

API
https://www.bortakvall.se/api/

Endpoints
GET /products
Lists all products, examples:
(https://github.com/andrenormanlang/candy_webshop/blob/main/instruction_images/Picture1.png)

POST /orders
Request
(https://github.com/andrenormanlang/candy_webshop/blob/main/instruction_images/Picture2.png)

Response
(https://github.com/andrenormanlang/candy_webshop/blob/main/instruction_images/Picture3.png)

Validation of the request is done according to the demo shown during the presentation of the task, see screencast: <https://youtu.be/Jnh2hM0wE4A.>
Deadline
Submission must take place no later than Wednesday 4 December at 23:55 during Assignment 2 for the course JavaScript Basic course – FED22M in Itslearning. I will create course groups, so it is enough that one from each group submits.
Reporting takes place on Thursday, January 5 at 9:00 am on site in the hall where you will proudly show off your work in front of your classmates (and me). Maximum 5 minutes per group.
Don't forget to submit your scrum boards + logs etc. to Mikko!
Submit

- Link to your GitHub repo
- Link to your published app
- About nine done G or VG level
- Any known bugs or comments you think I would benefit from when I review your submission

## Grading criteria

### Approved

- Follows the requirements specification above.
  Pass with distinction
- Follows the requirements specification above, incl. the requirement specification for Pass with distinction.
