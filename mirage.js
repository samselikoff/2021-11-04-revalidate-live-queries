import {
  belongsTo,
  createServer,
  Factory,
  hasMany,
  Model,
  Serializer,
} from "miragejs";
import faker from "faker";
import { parseISO, add, format } from "date-fns";

faker.seed(5);

export function makeServer({ environment = "test" } = {}) {
  let server = createServer({
    environment,

    // timing: 50,

    models: {
      person: Model.extend({
        events: hasMany(),
      }),
      event: Model.extend({
        person: belongsTo(),
      }),
    },

    serializers: {
      application: Serializer.extend({
        serializeIds: "always",
      }),
      personWithRelationships: Serializer.extend({
        embed: true,
        include: ["events"],
      }),
    },

    factories: {
      person: Factory.extend({
        name() {
          return faker.name.findName();
        },
        image() {
          return faker.image.avatar();
        },
      }),
    },

    seeds(server) {
      server.create("person", {
        events: [
          server.create("event", {
            content: "Applied to",
            target: "Front End Developer",
            date: "Sep 20",
            datetime: "2020-09-20",
            type: "applied",
          }),
          server.create("event", {
            content: "Advanced to phone screening by",
            target: "Bethany Blake",
            date: "Sep 22",
            datetime: "2020-09-22",
            type: "advanced",
          }),
          server.create("event", {
            content: "Completed phone screening with",
            target: "Martha Gardner",
            date: "Sep 28",
            datetime: "2020-09-28",
            type: "completed",
          }),
          server.create("event", {
            content: "Advanced to interview by",
            target: "Bethany Blake",
            date: "Sep 30",
            datetime: "2020-09-30",
            type: "advanced",
          }),
          server.create("event", {
            content: "Completed interview with",
            target: "Katherine Snyder",
            date: "Oct 4",
            datetime: "2020-10-04",
            type: "completed",
          }),
        ],
      });

      server.createList("person", 10);
    },

    routes() {
      this.namespace = "api";

      this.get("/people", function (schema) {
        return schema.people.all().sort((a, b) => {
          return a.name > b.name ? 1 : -1;
        });
      });
      this.get("/people/:id", function (schema, request) {
        let person = schema.people.find(request.params.id);

        return this.serialize(person, "person-with-relationships");
      });

      this.get("/events", (schema) => {
        return schema.events.all();
      });

      this.post("/events", function (schema, request) {
        let attrs = JSON.parse(request.requestBody);
        let person = schema.people.find(attrs.personId);
        let date = add(parseISO("2021-10-01"), {
          days: person.events.length,
        });
        let newEvents = [
          ["Applied to", "Front End Developer", "applied"],
          ["Advanced to phone screening by", "Someone", "advanced"],
          ["Completed phone screening with", "Someone", "completed"],
        ];
        let newEvent = newEvents[person.events.length % 3];

        return schema.events.create({
          content: newEvent[0],
          date: format(date, "MMM d"),
          datetime: format(date, "yyyy-MM-dd"),
          target: newEvent[1],
          type: newEvent[2],
          ...attrs,
        });
      });

      this.namespace = "";
      this.passthrough();
    },
  });

  // Don't log passthrough
  server.pretender.passthroughRequest = () => {};

  return server;
}
