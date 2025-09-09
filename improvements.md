# Improvemnts

| # | top priorities | impact | effort assessment |
|---|----------------|--------|-------------------|
| 1 | DDD principles | high | To summarise this long topic, we could apply DDD principles segregating the infrastructure part from the Business Logic and Domain notions. Alongise the SOLID principles such as IoC we could create simpler, portable code, easy to test, understand and extend. | Very High |
|||||

## Potential bug 

| # | item | impact | description |
|---|------|--------|-------------|
| 1 | `generateMessageFromTemplate` trusts user input | high | When trying to perform the substitutions the existing code is relying on the user's input to find if there's a possible code. A user could potentially use `{nonExistentKey}` due to a typo, this function would always return an error as it does not find a substitution. This user experience is worse than a valid output like `"Example test substituion {nonExistentKey}`. In this case the user would be aware of their mistake.|

## Opportunities for better UX patterns

| item | impact | description | effort |
|------|--------|-------------|--------|
| click out of the "Enrich" button | low | improved the user's usability as they don't need to click back in the button to exit the submenu. Would follow the same behaviour as when we have the import CSV modal. | low |
| Message(s) in a different table than lead table| high | In order to better see the Lead Messages we could have a different table were: We could see the messages and their recipients, We could have multiple messages addressed to the same recipient (currently we can only send 1 message per lead) | high (requires creating a messages table within the backend + its crud functionality alongside the relations between them and leads) |
| select button/name always visible whilst scrolling horizontallyu | medium | As the Lead table column number rows increases it's useful for the user to be aware on what rows their applying changes/creating message. For that locking the select tick box and the row's name/email while the rest of the columns move horizontally.| low/medium | 

## Developer experience (DX) improvements such as tooling, tests, and type safety

| # | item | impact | description | Effort |
|---|------|--------|-------------|--------|
| 1 |healthcheck route | high | it helps debugging and making sure that our system was properly deployed and is available without having to trigger any business related routes.| low |
| 2 | request validation json validation on POST/DELETE methods | medium |  we can move this validation into a middleware layer, and apply it to all the routes that need it. With low effort and medium impact as it will reduce the manual processs/forgetfulness of the devs on adding it to any new route created. (implemented ✅) | low |
| 4 | abstraction of the db instantiation | high | Create a singleton in a file to abstract the db instantiation. | low |
| 5 | segregate controller logic from route logic | low | on `index.ts`, move the routing into a `routes.ts` and a `controllers` folder that would hold a list of files 1 per endpoint. | very low |
| 6 | Global Error Handler | medium| In order to simplify the logic related to error handling across the whole application, we can create a global error handler alongside with custom errors e.g.`CustomError extends Error`. We can even create `BusinessLogicError` and `TechRelatedError` that depending on its type would return custom http error codes and messages. | low/medium |
| 7 | paralelise bulk message generation | low/medium | Currently the `app.post('/leads/generate-messages',...)` controller iterates sequentially to update the db with the new message. We could paralelise this using `Promise.all(...)`.A Similar codebase has been refactored in `createBulkLeadsController`| low |
| 8 | improve LeadRepository | medium| We should improve the current LeadRepository from a simple namespace and create a Class implementationa and a respective interface `LeadRepository implements ILeadRepository`. This would abstract all the db interactions away from the controller| low |
| 9 | Create LeadService | low/medium| Abstract Lead related operations away from controllers into a service class. Ideally it would implement a particular interface e.g. `LeadService implements ILeadService` in the current implementation a method `findNewLeads` would be part of it. Alongside the use of a `ILeadRepository` we would only use the service to all the operations lead related. Specifically in the controllers that handle leads  would remove the awareness of a db/repository and they would only perform actions throw the Service's methods. | low |
|10 | use Hooks to abstraction business logic from Components| medium| as per 9) in the backend we should apply a similar approach and move the business logic away from the components and organise it by purpose within a hooks folder.| low |
| 11 | DRY in `isValidLead` | low | there's a bit of duplicated code whilst verifying optional fields. I didn't have time to get an elegant solution with a clear name for its actions. | very low |
|12| logger | high| A logger system would improve our debugging capabilities when this app is in production | low |
|13 | UI testing | high | Using a system like Cypress or Playwright would improve Quality Assurance of the frontend system. | low/medium |
|14| Very Large Components (100+ lines) should be refactored into smaller, (if possible) reusable components | High | Components like `LeadsList` and `CsvImportModal` are very long and complex. This reduces readability/inteligibillity and complicates any intents on testing all their behaviours. The first action would be to separate it into logic subcomponents, and identify possible reusable Components (e.g. for tables Items component and Empty component). With this in mind a shared component folder would be advantageous. For this project I would identify the Table and TableText Cell as potential Shared Components.| medium/high |
|16 | More strict types within Lead| medium | Due to the current usage to only generate text messages fields like phone number, years at company are treated as strings at it works. This could be improved by using a `PhoneNumber` class, that would have a strict validation for phone number formats, and use `Number` in case of years.| low |