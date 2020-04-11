# Documentation

## Folder structure

### Constants
Readonly constant variables

### Enums
Enums

### Handlers
Handlers handle incoming information, like a Discord message for example.
Methods go in the manager if they are used by the managers themselves or other classes.
Sometimes a manager is not even necessary.
If you have a message that is sent more than once, either make it a method in the handler itself or in the message service.

**They may NOT interact with:**
Other Handlers

### Interfaces
Interfaces

### Managers
Managers manage part of the project. They manage the players for example, making sure a new one is made and cached.
Methods should be in the managers if they are changing the app data. Adding a card to a player for example.
Managers should not have public Get methods.
If a method is not used by the manager, and the method is not changing data from the manager, then it should probably go in a service instead. 

### Models
The data base Models

### Objects
The objects that are linked to the models.

### Providers
Providers provide data from the outside sources. Redis, Discord, Postgres.

### Services
Services serve you information and act out helpful stuff.
The difference between a service and a util is that a util is standalone where as a service makes use of objects and providers.
Services should not have Set methods (except for setting necessary data for the service).

### Utils
Standalone utility functions

### Index.ts
Main file.
