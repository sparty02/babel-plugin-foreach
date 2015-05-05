function forEachTransform (babel) {
	var t = babel.types;

	return new babel.Transformer('plugin-foreach', {
		CallExpression: function (node, parent) {
			var callee = node.callee;
			
			if (callee.property.name === 'forEach') {
				
				var arrayName = callee.object.name;

				var forEachCallback = node.arguments[0];
				var params = forEachCallback.params;

				var currentValueParam = params[0];
				
				var indexParam = params[1];
				// If the callback supplied an index variable, use it, else default it
				var indexParamName = indexParam ? indexParam.name : 'i';
				
				var arrayParam = params[2];
				var arrayParamName = arrayParam ? arrayParam.name : arrayName;

				
				var init = t.variableDeclaration('var', [
								t.variableDeclarator(
									t.identifier(indexParamName),
									t.literal(0)
								)
							]);

				var test = t.binaryExpression(
								'<',
								t.identifier(indexParamName),
								t.memberExpression(
									t.identifier(arrayName),
									t.identifier('length')
								)
							);

				var update = {
					type: 'UpdateExpression',
					operator: '++',
					argument: t.identifier(indexParamName),
					prefix: false
				}

				var body = forEachCallback.body;

				body.body.unshift(
					t.variableDeclaration('var', [
							t.variableDeclarator(
								t.identifier(currentValueParam.name), 
								t.memberExpression(
									t.identifier(arrayParamName),
									t.identifier(indexParamName),
									true
								)
							)
						])
					);
				
				// If the callback supplied an array variable, use it, else just keep array name
				if (arrayParam) {
					body.body.unshift(
						t.variableDeclaration('var', [
								t.variableDeclarator(
									t.identifier(arrayParamName), 
									t.identifier(arrayName)
								)
							])
						);
				}

				var forStatement = t.forStatement(init, test, update, body);			
				this.parentPath.replaceWith(forStatement);
			}
		}
	});
}

module.exports = forEachTransform;