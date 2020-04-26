/// K-means for 1 dimension for icSARS sample and 10 probes//
use GEO
function GetKMeans_icSARS(k){

    var collection = db.genome_icSARS.find().toArray() // get the data from the icSARS collection of 10 probes
    var target_array = collection[1].probeArray // get the second document (for icSARS)
    var clusters = Array.from(Array(k).keys()) // create clusters
    var centroids = target_array.sort(a => Math.random() - Math.random()).slice(0, k) // choose k random values as centroids

    function distance(a,b){
        return Math.abs(a-b)}; // calculates euclidian distance for 1 dimension

    function mean(element){
        var n = element.length
        var mean = element.reduce((a,b) => a+b)/n;
        return mean}; // calculates mean for an array

    do {
        
        var cluster_state = target_array.map(function(val){
            var distances = centroids.map(c => (distance(val,c))) // distance between each centroid and value
            min = Math.min.apply(Math,distances) // min distance
            nearest = distances.indexOf(Math.min.apply(Math,distances)) // get the nearest cluster
            return [val, nearest]
        }) // returns an array for each value with the value and the nearest cluster

        var all_clusters = clusters.map(function(cluster){
            var values = cluster_state.map(function(element){
                if (element[1]===cluster){return element[0]}})
            return values
        }); // for each cluster, find the values that belong to that cluster and put them in a new array

        var all_clusters = all_clusters.map(a => {
            var af = a.filter(c => {
                return c !== undefined;
                });
                return af
            }); // remove the 'undefined' elements
         
        var centroids_new = all_clusters.map(function(cluster){
            var centroid = mean(cluster)
            return centroid
        });// make a new array with the new centroids

        var centroids = centroids_new;

    } while (centroids!==centroids_new);

    var final_clusters = all_clusters.map(c => {
        var vals = c
        var index = all_clusters.indexOf(c)
        var centroid = centroids_new[index]
        var cluster = {cluster: all_clusters.indexOf(c), centroid: centroid, values: vals}
        return cluster
        }); // return the final clusters and centroids
        
    var intra_cluster_distance = final_clusters.map(c => {
        var cent = c['centroid']
        var distances = c['values'].map(v => distance(cent,v))
        var sum_distances = distances.reduce((a,b) => a+b)
        return sum_distances}); // calculate the intra-cluser distance for every cluster or the sum of distances from value to centroid
           
    var avg_intra_cluster_distance = mean(intra_cluster_distance); // take the average
        
    return {final_clusters, avg_intra_cluster_distance};
};

GetKMeans_icSARS(3);

// TO DO: how to link them back to their probes?
// TO DO if time: find the optimal k
// TO DO if time: more than 1 dimension