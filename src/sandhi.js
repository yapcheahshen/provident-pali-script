export const Rules={ //規則號不得為 0,1,2
// a+K=>kVK and so on are automatically accepted
// i-K=>kVK , all other stem are keep intact

	'a-A=A':'3',
	'a-I=E':'3',
	'a-I=A':'4',
	'a-I=IA':'5',
	'I~aA=':'3',


	'a-U=O':'3',
	'a-U=A':'4',
	'a-U=U':'5',
	'a-U=UA':'6',

	'a-Ū=UA':'3',
	'a-Ī=IA':'3',

	'A-AA=':'3',
	
	'a-E=E':'3',
	'M~AA=m':'3',  //kImAnIsMs << kIM-aAnIsMs, remove left, keep right

	'I+I=IA':'3',
	'I+A=jVJ':'2', //this is a special rule for bodhi+anga
	'I+U=UA':'3',

	'U+A=UA':'3', //長音化

	'U+I=U':'3',
	'U+I=O':'4',
	'U+I=UA':'5',
	'U+U=UA':'6',
	'O+A=':'3',
	'y+v=bVb':'2', //this is a special rule for udaya+vaya  ==>udayabbaya

	'V+A=':'3',
	'a-E=A':'3',
}
export const ELIDENONE=0,ELIDELEFT=1, ELIDERIGHT=2 ,ELIDEBOTH=3;
export const JoinTypes={};
for (let rule in Rules) {
	const jt=Rules[rule];
	if (!JoinTypes[jt]) JoinTypes[jt]={};
	let left,right,sandhi;

	if (rule.indexOf('~')>0) {
		[left,right,sandhi]=rule.split(/[=~]/);
		JoinTypes[jt][left+'+'+right]='~'+sandhi; //right side is not elided
	} else if (rule.indexOf('-')>0) {
		[left,right,sandhi]=rule.split(/[=\-]/);
		JoinTypes[jt][left+'+'+right]='-'+sandhi; //left is not elided
	} else{
		[left,right,sandhi]=rule.split(/[=\+]/);
		JoinTypes[jt][left+'+'+right]=sandhi;
	}
}


export const isAssimiliar=(s1,s2)=>{
	if ( s2.length!==3 || s2[1]!=='V' || s1[0]!==s2[2]) return false;
	if (s2[0].match(/[ckgjbptds]/) && (s1[0]==s2[2] || s1[0]==s2[2].toLowerCase()) ) return true;

	if (s1=='F' && (s2[2]=='W' || s2[2]=='F')) return true;
	if (s1=='Q' && (s2[2]=='X' || s2[2]=='Q')) return true;
}
export const getRule=(left,right,leftconsumed,rightconsumed,sandhi,verbose)=>{
	if (!sandhi && !leftconsumed && !rightconsumed) return 0;

	let rulekey='-';
	if (leftconsumed && !rightconsumed) rulekey='~';
	else if (rightconsumed) rulekey='+';

	let key=left+rulekey+right+'='+sandhi;

	verbose&&console.log('rulekey',rulekey,leftconsumed,rightconsumed)
	let r=Rules[key];

	if (!r && rulekey=='+') { //for ['kImAnIsMs',['kIM','aAnIsMs'],'kIM3AAnIsMs',['kI<M','m','AAnIsMs']],
		rulekey='~'; //try
		key=left+rulekey+right+'='+sandhi;
		r=Rules[key]
	}
	if (!sandhi && !right && (!left||left==='a')) return ELIDENONE;
	if (!sandhi && right==='') return ELIDELEFT;
	if (!sandhi && (left===''||left==='a') && !right) return ELIDERIGHT;

/*
	if (!r) {
		key='+'+right;
		r=Rules[key];
		if (!r) {
			key=left+'+';
			r=Rules[key];
		}
	}
*/
	// verbose&&console.log('RR ',right,sandhi,isAssimiliar('C',sandhi))
	//try assimilization rule
	if (!r && isAssimiliar(right,sandhi)) {
		if (isVowel(left)) r=ELIDEBOTH;
		else if (left.match(/[AIUOE]$/)) r=ELIDERIGHT;//default keeping the stem
	}
	return parseInt(r)||ELIDENONE;
}

export const getLeft=str=>{
	const at=str.lastIndexOf('<');
	return ~at?str.slice(at+1):'';
}
export const getRight=str=>{
	const at=str.indexOf('>');
	return ~at?str.slice(0,at):'';
}

export const getTailSyl=str=>{ //return vowel
	const ch1=str.slice(str.length-1), ch2=str.slice(str.length-2);
	if (ch2==='IA') return 'Ī'
	else if (ch2==='UA') return 'Ū'
	else if (ch1==='E') return 'E'
	else if (ch1==='O') return 'O'
	else if (ch1=='A') return 'A'
	else if (ch1=='I') return 'I'
	else if (ch1=='U') return 'U'
	else if (ch1=='V') return 'V'
	else if (ch1=='M') return 'M'
	return 'a';
}

export const getHeadSyl=str=>{ //return vowel or consonant
	const ch1=str.slice(0,1), ch2=str.slice(0,2);
	if (ch2==='aA') return 'aA'; //not changing, becuase a is dropped automatically
	else if (ch2==='AA') return 'AA';
	else if (ch2==='iA') return 'Ī';
	else if (ch2==='uA') return 'Ū';
	else if (ch1==='ū') return 'Ū';
	else if (ch1==='ī') return 'Ī';
	else if (ch1.toLowerCase()==='a') return 'A';
	else if (ch1.toLowerCase()==='u') return 'U';
	else if (ch1.toLowerCase()==='i') return 'I';
	else if (ch1.toLowerCase()==='o') return 'O';
	else if (ch1.toLowerCase()==='e') return 'E';
	else return ch1+(ch2[1]=='A'?'A':''); //because 
}

export const sbProvident=str=>{ //convert long vowel to single byte, for easier comparison
	return str.replace(/UA/g,'Ū').replace(/IA/g,'Ī')
	.replace(/iA/g,'ī').replace(/uA/g,'ū')
	// .replace(/aA/g,'ā')
}

export const mbProvident=str=>{//convert single byte vowel back to provident format
	return str.replace(/Ū/g,'UA').replace(/Ī/g,'IA')
	.replace(/ī/g,'iA').replace(/ū/g,'uA')
	// .replace(/ā/g,'aA')
}

export const getAssimiliar=w=>{
	let out='';
	const m=w.match(/^([CBKPJGcbkpjgts])/);
	if (m)	return m[1].toLowerCase()+'V'+m[1][0];
	else if (w[0]=='F') return 'FVW';
	else if (w[0]=='F') return 'QVX';
}
const sameAlpha=(v1,v2)=>{
	if (v1.match(/[aeiouAEIUO]/)) return v1.toUpperCase()===v2.toUpperCase();
	return v1===v2;
}
export const isVowel=s=>!!s.match(/^[aeiouīūāŪĪĀAEIOU]/);
export const isConsonant=s=>!isVowel(s);

export const getJoinType=(jt,left,right,verbose)=>{
	let join=parseInt(jt);
	const jtype=JoinTypes[join];
	const L=getTailSyl(left),R=getHeadSyl(right);
	let sandhi ,keepLeft=(join==ELIDERIGHT||join==ELIDENONE)
	,keepRight=(join==ELIDELEFT || join==ELIDENONE);
	let adv=0,autorule=false;
	if (join>=ELIDEBOTH) {
		sandhi=jtype[left+'+'+R];
		if (typeof sandhi==='undefined' && isConsonant(left)) { //
			sandhi=jtype[L+'+'+R];
			// console.log('try '+L+'+'+R,sandhi,jtype)
		}
	}
	verbose&&console.log('raw sandhi',sandhi, )

	if (typeof sandhi=='undefined') {
		if (jt==ELIDEBOTH || jt==ELIDERIGHT) {
			const assim=getAssimiliar(right);
			verbose&&console.log('assim',assim,right,jt)
			if (assim) {
				if (jt==ELIDERIGHT && sandhi) sandhi='-'+sandhi;
				verbose&&console.log('auto sandhi',sandhi)
				autorule=true;
				sandhi=assim;				
			}
		}
	}
	if (!sandhi)sandhi='';


	if (sandhi && (sandhi[0]=='-'||sandhi[0]=='~')) {
		if (sandhi[0]=='-') keepLeft=true;
		if (sandhi[0]=='~') keepRight=true;
		sandhi=sandhi.slice(1)
	}
	verbose&&console.log('sandhi',sandhi,'keepLeft',keepLeft,'keepRight',keepRight)

	//autorule keep left, consume right
	let leftconsumed=(!autorule &&(!keepLeft  || join===ELIDELEFT) )?left.length:0; //vowel only , can do toLowerCase

	if (leftconsumed>1) leftconsumed=1;
	
	const rightconsumed=!keepRight&&((join===ELIDERIGHT ||join>=ELIDEBOTH)|| !sameAlpha(right,R) || autorule)?right.length:0;
	verbose&&console.log('rightconsumed',rightconsumed,'autorule',autorule)
	// verbose&&console.log('leftconsumed',leftconsumed,left.length,(join===ELIDERIGHT ||join===ELIDEBOTH||right.toUpp))

	return {keepRight,keepLeft,sandhi,join,rightconsumed,leftconsumed}
}