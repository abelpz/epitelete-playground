import { RepositoryApiFactory } from "dcs-js";

export default {
  ...RepositoryApiFactory({
    basePath: "https://qa.door43.org/api/v1"
  })
};
