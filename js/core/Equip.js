export default class Equip {

    constructor(_nomEquip, _llistaMembres = []) {

        this.nomEq = _nomEquip;
        this.membresEq = _llistaMembres;

        this.posicioEq = 0;

        this.barra1 = 0;
        this.barra2 = 0;

    }

    moure(passos) {

        this.posicioEq += passos;

    }

    afegirBarra1(punts = 1) {

        this.barra1 += punts;

    }

    eliminarBarra1(punts = 1) {

        this.barra1 -= punts;

    }

    afegirBarra2(punts = 1) {

        this.barra2 += punts;

    }

}