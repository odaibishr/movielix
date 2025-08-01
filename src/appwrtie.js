import { Client, Databases, ID, Query } from "appwrite";


const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchTerm = async (searchTerm, movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal("searchTerm", searchTerm),
        ]);

        // if document found, update the count by 1
        if(result.documents.length > 0) {
            const document = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, document.$id, {
                count: document.count + 1,
            })
        } else {
            // if no document found, create a new one
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count"),
        ]);

        return result.documents;
    } catch (error) {
        console.log(error);
    }
}