# ADA - Dashboard

## About 
It's a NodeJS webapp which is used for data analytics purpose which connects to redshift
clusters at the backend and automates the process of running queries on redshift database.
 
## Technologies
### Backend
* NodeJS
    * Express
    * Handlebars
    * Node-redshift
    * Node-cache
* Database
    * Redshift - Analytics data
    * Sqlite - Metadata   
### Frontend
* Bootstrap
* JQuery
* JQueryUI
* JqueryUi-touch-punch
* Pivottable
* Plotly
* Font-Awesome
     
## DB-Schema(Sqlite)
**analytics_cases**

id  | title | tablename | table_columns
----- | -------- | ----- | ---|

 **all_queries**  
 
  id |usecase_id  | type | title | query | last_fetched|
  ---| ----- | -------- | -------- | ----| ------------|
   **all_plots**  
     
   id | usecase_id  | x-axis | y-axis | date_time_format | title| query | last_fetched |
    ---- |  ----- | -------- | -------- | ----| ------------| ---- | -------|



