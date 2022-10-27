## Models

- User Model:

  - username: type: String, required: true, unique, trim
  - email: type: String, unique, lowercase: true, required: true, trim: true
  - passwordHash: type: String, required: true
  - emailConfirmation: type: Boolean, default: false
  - avatarUrl: type: String, default: "images/default_avatar.jpg"
  - comments: [{ type: Schema.Types.ObjectId, ref: "comment" }]
  - isProfileComplete: default: false, Boolean, required
  - usertype: enum: [author, reader]
  - author: [{ type: Schema.Types.ObjectId, ref: "author" }]

- author Profile model: (author model extends/references user model )

  - fullName: type: String, required, trim
  - avatarUrl: type: String, required: true
  - skills: type: String, required: true
  - experience: type: String, required: true
  - aboutTxt: type: String, required: true

- Comment Model:

  - author: { type: Schema.Types.ObjectId, ref: "User" }
  - title: type: String, maxLength: 50,
  - content: type: String, maxLength: 200, required: true
  - timestamps: true

- Publication:
  - author: { type: Schema.Types.ObjectId, ref: "User" }
  - ❓ content: defined by editor.js JSON data ❓
  - comments: [{ type: Schema.Types.ObjectId, ref: "comment" }]
  - timestamps: true

## Pages & Views

- Main:
  - home.hbs
  - (Should show a couple of articles sorted by Topic/Category )
- Registration:
  - sign-up.hbs
  - (Let the user decide on registration if he will be an author => )
  - (if no provide form for reader-sign up, then let the default val "isProfileComplete: false" )
  - (if yes provide form for authors with extra mandatory fields, then set "isProfileComplete: true")
- Log in:

  - sign-up.hbs

- Reader profile:

  - user/reader-profile.hbs
  - (show a paginated list of followed authors)
  - (show amount + (perhaps a List? ) of created comments with anchor to that blog entry)

- Author profile:

  - user/author-profile.hbs
  - (Should show amount of Followers/subscribers, as an anchor to users/follower-list.hbs)
  - (show amount + (perhaps a List? ) of created comments with anchor to that blog entry)
  - (Could be designed as a dashboard which shows Meta data about articles and followers)

- author create new blog/Publication entry:
- article/new-entry.hbs
- (show up and use editor.js to create article)

- Blog/Publication entry details page:
  - article/details.hbs
  - (Should show all comments made to article)
  - (if authenticated user (reader/author) show create new comment form )
  - (should have edit and delete btn displayed to authors)
- Blog/Publication Edit:

  - article/edit.hbs
  - (Should show up a page with editor.js pre filled with current data)

- Blog/Publication Delete:

  - article/delete-confirm.hbs

- Author Follower list:
- users/follower-list.hbs
- (show a paginated list of followers to the author)

- Reader followee list:
  - users/followee-list.hbs
  - (show a paginated list of followed authors to the reader/author)

## Routes

- for main : app.use('/', baseRouter);
  - GET -> router.get('/', (req, res, next) => {});
  -
- for auth: app.use('/authentication', authenticationRouter)
  - GET -> router.get('/sign-up', (req, res, next) => {})
  - POST -> router.post('/sign-up', ...
  - GET -> router.get('/sign-in', ...
  - POST -> router.post('/sign-in', ...
  - POST -> router.post('/sign-out', ...
  -
- for user/member : app.use('/user', userRouter);
  - GET -> userRouter.get('user-profile', (req, res, next) => {})
  - GET -> userRouter.get('author-profile', (req, res, next) => {})
- for blog/publication entry: app.use('/article', articleRouter);
  - GET ->

### Status icons

- ☑ Started
- ✅ Done
- ❎ Discarded
- ❌ Problems
- ❓ Advice needed
