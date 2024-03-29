# This file is generated by Nx.
#
# Build the docker image with `npx nx docker-build cubicfox-booking`.
# Tip: Modify "docker-build" options in project.json to change docker build args.
#
# Run the container with `docker run -p 3000:3000 -t cubicfox-booking`.
FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system cubicfox-booking && \
          adduser --system -G cubicfox-booking cubicfox-booking

COPY dist/cubicfox-booking cubicfox-booking
RUN chown -R cubicfox-booking:cubicfox-booking .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix cubicfox-booking --omit=dev -f install

CMD [ "node", "cubicfox-booking" ]
