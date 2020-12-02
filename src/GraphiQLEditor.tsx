import {GraphiQL} from "graphiql";
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";

export default function GraphiQLEditor() {
    const graphiqlFetcher = useGraphiQLFetcher();
    return (
        <GraphiQL fetcher={graphiqlFetcher} />
    );
}
