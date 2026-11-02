import PageHeader from "../components/PageHeader";

export default function Historia() {
  return (
    <div className="page page-mid prose">
      <PageHeader eyebrow="El club" title="Historia y estatutos" />

      <h2>Nuestra historia</h2>
      <p>
        Roda Bonito nació una noche de verano en una pista de fútbol sala de barrio, cuando un grupo de
        amigos que llevaba años jugando los domingos por la mañana decidió que merecía algo más que un
        grupo de WhatsApp y una camiseta prestada. El nombre surgió casi de broma: alguien regateó a
        tres rivales seguidos en un partido amistoso, alguien gritó desde la banda «¡qué roda más
        bonita!», y la frase se quedó para siempre.
      </p>
      <p>
        Desde entonces, Roda Bonito ha jugado en pistas de fútbol 7 y de fútbol sala, con una plantilla
        que crece partido a partido. No nacimos para ganar títulos, sino para no perder nunca las ganas
        de juntarnos a jugar, y aun así, con los años, el escudo ha empezado a pesar: cada convocatoria,
        cada entrenamiento y cada partido compartido construyen la identidad de un equipo que ya
        no es solo una pandilla de amigos, sino un club con historia propia.
      </p>
      <p>
        Los colores rojo y negro se eligieron porque eran los únicos petos que sobraban en el polideportivo
        aquella primera noche. El rojo representa la pasión con la que se defiende el escudo, y el negro,
        la seriedad con la que se entrena para merecerlo.
      </p>

      <h2>Estatutos del club</h2>
      <ol>
        <li>
          <strong>Compromiso.</strong> Todo jugador convocado debe confirmar su disponibilidad en la web
          con la mayor antelación posible. La falta de confirmación repetida sin aviso puede suponer no
          ser convocado en el siguiente partido oficial.
        </li>
        <li>
          <strong>Respeto.</strong> Las decisiones del entrenador sobre convocatorias y alineaciones, y
          las del capitán dentro y fuera del terreno de juego, se respetan. Los desacuerdos se hablan
          después del partido, nunca durante.
        </li>
        <li>
          <strong>Puntualidad.</strong> Se llega al punto de encuentro con tiempo suficiente para calentar.
          Los retrasos injustificados pueden suponer empezar el partido en el banquillo.
        </li>
        <li>
          <strong>Material.</strong> La equipación del club (rojo y negro) es de uso obligatorio en
          partidos oficiales. En amistosos y entrenamientos, el sentido común manda.
        </li>
        <li>
          <strong>Convivencia.</strong> Lo que pasa en el vestuario y en el grupo se queda en el
          equipo. Roda Bonito se construye sobre la confianza entre compañeros.
        </li>
        <li>
          <strong>Cantera propia.</strong> Cualquier nuevo jugador debe completar su ficha (nombre,
          posición, altura y peso) antes de poder confirmar disponibilidad o ser convocado. Un club se
          conoce a sí mismo para poder crecer.
        </li>
        <li>
          <strong>Espíritu.</strong> Se gana, se empata y se pierde siempre con la misma camiseta puesta.
          El resultado no define el valor de la "roda".
        </li>
      </ol>
    </div>
  );
}
