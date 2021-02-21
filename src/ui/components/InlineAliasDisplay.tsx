import React from 'react';
import { connect } from 'react-redux';
import { isWhiteSpaceLike } from 'typescript';
import reducer from 'ui/modules/redux/notes/reducer';
import ReactDOMServer from 'react-dom/server';

// ! Objectifs avec cet editeur
// ! + Permettre la selection/edition/copie, comme un editeur "normal"
// ! + Permettre un affichage alternatif, potentiellement complexe (liste de taches)
// ! + Permettre une mise a jour a partir de changements de variables a l'image des props/du store
// ! + Permettre des interactions (clicks, hover) dans l'editeur sur les affichages complexes
// ! Types d'affichage complexes:
// ! 1) Inline (alias, variables simples etc...)
// ! 2) Block (todo-list, code block?, video-player, ... widgets grafana quoi)
// ! 3) Outline (a cote du texte, en debut ou en fin de ligne, comme par exemple les tags de paragraphe ?)

// ? Option 1: React (pas tres concluant)
// ? Ce qui serait ideal, a la fois pour le style et les interactions (clicks)
// ? ce serait d'avoir d'un cote l'event re-render-${id} pour que le DOM de l'editeur
// ? match la taille du vrai componenent en faisant un ce.detail.html = this.ref.outerHTML
// ? et EN PLUS de donner la position au component react pour qu'il s'ache ou s'afficher
// ? comme ca on va placer en superposition l'element react et le placeholder dans l'editor
// ? Et eventuellement, pour pouvoir "editer" le placeholder sous-jacent, celui cache sous le component react
// ? on pourrait detecter qu'on est actuellement en focus sur un placeholder, et afficher le composant au dessus avec une
// ? opacity de 0.1 par exemple (ou meme de 0)
// ? Comme ca, on pourra changer la variable pointee. Des qu'on a un nouveau match OU lorsqu'on sort du placeholder (blur, ou curseur ailleurs)
// ? on detruit le component d'avant et on affiche le nouveau a la place.

// ? Option2: Oublier react, implementer ca tranquillement soi-meme.
// ? Pour un alias, ok, mais pour une task list ?
// ? Task list : dans le dom de l'editeur, on aurait une div qui contient plusieurs sous elements (task-list-line)
// ? ce qui permet bien de selectionner le contenu, de l'afficher avec du style.
// ?

// ? Option3: Melanger les deux ? Comment ? Pourquoi ?

const containerStyle: any = {
  position: 'relative',
  padding: '4px',
  background: 'white',
  borderRadius: '4px',
  margin: '2px',
  color: 'black',
}

const variableNameStyle: any = {
  position: 'absolute',
  top: `-10px`,
  transform: 'translateX(50%)',
  right: 0,
  fontSize: '8px',
  color: 'black',
  background: 'dodgerblue',
  padding: '2px',
  lineHeight: 'normal',
  borderRadius: '4px',
}

class InlineAliasDisplay extends React.Component<any, any> {
  ref: any;

  constructor(props: any) {
    super(props);
    this.ref = undefined;
    this.state = {
      selected: false,
    }
  }

/*  componentDidMount() {
    if (this.ref) {
      console.log('React parent component mounted first time, has ref, dispatch render event', { uuid: this.props.uuid });
      const ce = new CustomEvent(`re-render-${this.props.uuid}`, {
        detail: {
          html: this.ref.outerHTML
        }
      });
      document.dispatchEvent(ce);
    }
  }

  componentDidUpdate() {
    if (this.ref) {
      console.log('React parent component updated, has ref, dispatch render event', { uuid: this.props.uuid });
      const ce = new CustomEvent(`re-render-${this.props.uuid}`, {
        detail: {
          html: this.ref.outerHTML
        }
      });
      document.dispatchEvent(ce);
    }
  }*/


  render() {
    const { name, value } = this.props.alias;
    const { locals } = this.props;
    let display = value;
    if (locals[name]) {
      display = locals[name];
    }
    if (this.state.selected) {
      display = name;
    }
    const style = {
      ...containerStyle,
    }
    if (this.props.rect && containerStyle) {
      style.position = 'absolute';
      style.left = this.props.rect.x;
      style.top = this.props.rect.top;
      style.width = this.props.rect.width;
    }
    return (
      <div
        style={style}
        ref={(ref) => {
          this.ref = ref;
        }}
        onFocus={() => {
          this.setState({ selected: true });
          console.log('Focus ' + name);
        }}
        onClick={() => {
          console.log({ ref: this.ref, props: this.props });
        }}
        onBlur={() => {
          this.setState({ selected: false });
          console.log('Blur ' + name);
        }}>
        {display}
        {/* <div contentEditable={false} style={variableNameStyle}>
          {name}
        </div> */}
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  locals: state.global.locals,
});

export default connect(mapStateToProps)(InlineAliasDisplay);