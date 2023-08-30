const globalVariables = {
	rootFolder: '', //window.location.host === '' ? '/' : '',
	baseUrl:
		window.location.host.includes('liveat') ?
			'https://api.universe-telecom.com/liveatapi/' :
			'http://192.168.100.51/liveatapi/' // local
};

export default globalVariables;
