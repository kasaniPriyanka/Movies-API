const express=require("express");
const path=require("path");
const {open}=require("sqlite");
const sqlite3=require("sqlite3");

const app=express();
app.use(express.json());

const dbPath =path.join(__dirname,"moviesData.db");

let db=null;

const InitializeDBServer=async ()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        });
        app.listen(3000,()=>{
            console.log("Server Running at http://localhost:3000/ ");

        });
     } catch(e){
        console.log(`DB ERROR: ${e.message}`);
        process.exit(1);
    
    };
};
InitializeDBServer();

const convertMovieDBObjectToRespondObject=(dbObject)=>{
    return {
        movieId:dbObject.movie_id,
        directorId:dbObject.director_id,
        movieName:dbObject.movie_name,
        leadActor:dbObject.lead_actor,
        };
};

const convertDirectorObjectToResponseObject=(dbobject)=>{
    return{
         directorId:dbobject.director_id,
         directorName:dbobject.director_name,
    };
};

app.get("/movies/", async (request, response)=>{
    const getMoviesQuery=`SELECT * FROM movie;`;
    const movieArray=await db.all(getMoviesQuery);
    response.send(movieArray.map((eachMovie)=>{
        convertMovieDBObjectToRespondObject(eachMovie));
    });

});

//API2

app.post("/movies",async (request,response)=>{
    const {movieId,directorId,movieName,leadActor}=request.body;
    postMovieQuery=`
    INSERT INTO movie(movie_id,director_id,movie_name,lead_actor)
    VALUES (${movieId},${directorId},${movieName},${leadActor});
    `;
    await db.run(postMovieQuery);
    response.send("Movie Successfully Added");
});

//API3

app.get("/movies/:movieId/",async(request,response)=>{
    const{movieId}=request.params;
    const getMovieQuery=`
    SELECT * FROM movie
    WHERE movie_id=${movieId};
    `;
    const state=await db.get(getMovieQuery);
    response.send(convertMovieDBObjectToRespondObject(state));
});

//API4

app.put("/movies/:movieId/",async(request,response)=>{
    const {movieId}=request.params;
    const {movieId,directorId,movieName,leadActor}=request.body;
     const updateDistrictQuery = `
     UPDATE
       movie
    SET
    movie_id = '${movieId}',
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor},
  WHERE
    movie_id = ${movieId};
  `;

  await db.run(updateDistrictQuery);
  response.send("Movie Details Updated");
}); 

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId} 
  `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

//API 7

app.get("/directors/:directorId/movies/",async(request,response)=>{
    const moviesWithDirectorQuery=`
    SELECT * FROM movie NATURAL JOIN director
    WHERE director_id=${directorId};
    `;
    const movie=await db.get(moviesWithDirectorQuery);
    response.send({movieName:movie.movie_name});
});
module.exports = app;


