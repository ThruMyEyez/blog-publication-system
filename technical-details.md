## Models

- User Model:

  - username: type: String, required: true, unique, trim
  - email: type: String, unique, lowercase: true, required: true, trim: true
  - passwordHash: type: String, required: true
  - emailConfirmation: type: Boolean, default: false
  - avatarUrl: type: String, default: "images/default_avatar.jpg"
  - isProfileComplete: type: Boolean, default: false, required: true
  - usertype: enum: [author, reader]
  - timestamps: true

- Profile Model:

  - fullName: type: String, required: true, trim: true
  - age: type: Number, required: true, trim: true
  - gender: enum: ['Male', 'Female'], required: true
  - skills: type: array
  - experience: type: array
  - aboutTxt: type: String
  - user: { type: Schema.Types.ObjectId, ref: "User" }
  - timestamps: true

- Follow Model:

  - follower: { type: Schema.Types.ObjectId, ref: "User" }
  - followee: { type: Schema.Types.ObjectId, ref: "User" }
  - timestamps: true

- Publication Model:

  - author: { type: Schema.Types.ObjectId, ref: "User" }
  - title: type: String, required: true, trim: true, minLength: 3, maxLength: 512
  - categories: type: array
  - content: { type: Object, required: true}
  - numberOfViews: { type: Number, default: 0}
  - timestamps: true

- Comment Model:

  - publication: { type: Schema.Types.ObjectId, ref: "Publication" }
  - author: { type: Schema.Types.ObjectId, ref: "User" }
  - message: type: String, maxLength: 1024,
  - isApproved: type: Boolean, default: true, required: true
  - timestamps: true

- History Model:
  - publication: { type: Schema.Types.ObjectId, ref: "Publication" }
  - user: { type: Schema.Types.ObjectId, ref: "User" }
  - timestamps: true

## Pages & Views

- Main:
  - Home
  - (Should show a couple of articles sorted by Topic/Category )
- Registration:
  - Sign-up
    - At the first registration form we will ask the user to choose between two options that we have for User Type (Reader, Author)
- Log in:

  - Sign-in

- Profile:

  - Profile Main Page
  - About me (Tab)
  - My Published Articles (Tab/paginated list)
  - Follower / followee (Tab/paginated list)
  - My History "Viewed/Readed Articles Topics" (Tab/paginated list)
  - All My Comments (Tab/paginated list)

- Publication
  - Create Publication
    - Article Metadata Form
    - Article Content Form (editor.js)
  - Edit Publication
    - Article Metadata Form
    - Article Content Form (editor.js)
  - Delete confirmation Publication
- List of Articles
- Single Article Details Page
  - (Should show all comments made to article)
  - (if authenticated user (reader/author) show create new comment form )
  - (should have edit and delete btn displayed to authors)
- Comment Creation Form
- Edit Comment Form

## Routes

- Main (Root of Project):
- app.use('/', baseRouter);
- GET -> router.get('/', (req, res, next) => {});

- Registration / Log-in / Log-out:

  - app.use('/authentication', authenticationRouter)
    - GET -> router.get('/sign-up', (req, res, next) => {}) (need improvement) (Artur, Mojeeb)
    - POST -> router.post('/sign-up', ... (need improvement) (Artur, Mojeeb)
    - GET -> router.get('/sign-in', ... (finished)
    - POST -> router.post('/sign-in', ... (finished)
    - POST -> router.post('/sign-out', ... (finished)

- Profile

  - app.use('/profile', profileRouter)

    - GET -> router.get('/', (req, res, next) => {}) () (Mojeeb, Artur)
    - GET -> router.get('/complete', (req, res, next) => {}) (need improvement) (Artur)
    - POST -> router.post('/complete', ... (need improvement) (Artur)
    - GET -> router.get('/about-me', (req, res, next) => {}) (Mojeeb)
    - GET -> router.get('/follow-list', (req, res, next) => {}) (Artur)

    - GET -> router.get('/:id/edit', (req, res, next) => {}) (Artur, // I think we forgot this)
    - POST-> router.post('/:id/edit', (req, res, next) => {}) (Artur, // I think we forgot this)

    - GET -> router.get('/:id/delete', (req, res, next) => {}) (Artur, // I think we forgot this)
    - POST-> router.get('/:id/delete', (req, res, next) => {}) (Artur, // I think we forgot this)

    - POST -> router.post('/:id/follow', ... (Artur)
    - POST -> router.post('/:id/unfollow', ... (Artur)

    - GET -> router.get('/my-history', (req, res, next) => {}) (Artur)
    - GET -> router.get('/my-comments', (req, res, next) => {}) (Artur)

  - app.use('/publication', publicationRouter)

    - GET -> router.get('/', (req, res, next) => {}) (Artur, Mojeeb)
    - GET -> router.get('/create', (req, res, next) => {}) (Mojeeb)
    - POST-> router.post("/create", (req, res, next) => {}) (Mojeeb)
    - GET -> router.get('/:id/content', (req, res, next) => {}) (Mojeeb)
    - POST-> router.post("/:id/content", (req, res, next) => {}) (Mojeeb)
    - GET -> router.get("/:id/edit", (req, res, next) => {}) (Mojeeb)
    - POST-> router.post("/:id/edit", (req, res, next) => {}) (Mojeeb)
    - GET -> router.get("/:id/content/edit", (req, res, next) => {}) (Mojeeb)
    - POST -> router.get("/:id/content/edit", (req, res, next) => {}) (Mojeeb)
    - GET -> router.get("/:id/delete", (req, res, next) => {}) (Artur)
    - POST-> router.post('/:id/delete', routeGuard, (req, res, next) => {}); (Artur)
    - GET -> router.get('/:id', (req, res, next) => {}) (Artur, Mojeeb)

    - POST-> router.post('/:id/comment', routeGuard, (req, res, next) => {}); (Artur)
    - POST-> router.post('/:id/comment/:commentId/edit', routeGuard, (req, res, next) => {}); (Artur)

    - POST-> router.post('/:id/comment/:commentId/approve', routeGuard, (req, res, next) => {}); (Artur)
    - POST-> router.post('/:id/comment/:commentId/disapprove', routeGuard, (req, res, next) => {}); (Artur)
