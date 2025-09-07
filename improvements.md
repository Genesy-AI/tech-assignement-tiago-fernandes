# Improvemnts

| top priorities | impact | effort assessment |
|------|--------|-------------|


# Opportunities for better UX patterns

| item | impact | description | effort |
|------|--------|-------------|--------|
| click out of the "Enrich" button | low | improved the user's usability as they don't need to click back in the button to exit the submenu. Would follow the same behaviour as when we have the import CSV modal. | low |
| Message(s) in a different table than lead table| high | TODO: explain how can we list all the messages targeted for a group of leads + list the users that would be affected + how does create a message for a set of users would create it? + data structure in the backend affection | medium / high|
| select button always visible | medium | TODO | low/medium | 

# Developer experience (DX) improvements such as tooling, tests, and type safety

| item | impact | description |
|------|--------|-------------|
|healthcheck route | high | it helps debugging and making sure that our system was properly deployed and is available without having to trigger any business related routes.|
| request validation json validation on POST/DELETE methods | medium |  we can move this validation into a middleware layer, and apply it to all the routes that need it. With low effort and medium impact as it will reduce the manual processs/forgetfulness of the devs on adding it to any new route created. |
| global error handling strategy| high | create specific error classes that would be thrown across the system, with a global error handler that would properly adjust the error message returned alongside the http error code. Will remove most of duplication happenning within the controller functions.|

